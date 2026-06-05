import { create } from 'zustand'
import * as tus from 'tus-js-client'
import toast from 'react-hot-toast'
import { TUS_CHUNK_SIZE_BYTES } from '@/lib/constants/tus-upload'

export type UploadStatusValue = 'uploading' | 'paused' | 'completed' | 'error'

export interface FileUploadStatus {
    fileName: string
    progress: number
    status: UploadStatusValue
    error?: string
    size: number
}

export interface CompletedUpload {
    fileName: string
    s3Url: string
    folderPath: string
}

interface UploadState {
    // Original files (necessary if we want to restart/resume correctly in some cases)
    // Note: Storing File objects in Zustand is generally okay as long as they aren't too many
    files: File[] | null

    // State for tracking progress and instances
    uploading: boolean
    overallProgress: number
    timestampFolder: string | null

    // Tracking per-file
    uploadInstances: Record<string, tus.Upload>
    uploadStatuses: Record<string, FileUploadStatus>
    completedUploads: Record<string, CompletedUpload>

    // Derived form data
    autoS3Path: string | null

    // Actions
    setFiles: (files: FileList | null) => void
    startUpload: (s3UploadPath: string) => Promise<void>
    pauseUpload: (fileName: string) => void
    resumeUpload: (fileName: string) => void
    cancelUpload: (fileName: string) => void
    // Bulk pause/resume used on logout/login so in-flight uploads are held
    // (not cancelled) while the user is signed out. The tus instances stay in
    // memory, so resumeAll() picks up each file from the exact byte it was at.
    pauseAll: () => void
    resumeAll: () => void
    reset: () => void
    clearFiles: () => void
}

export const useUploadStore = create<UploadState>((set, get) => ({
    files: null,
    uploading: false,
    overallProgress: 0,
    timestampFolder: null,
    uploadInstances: {},
    uploadStatuses: {},
    completedUploads: {},
    autoS3Path: null,

    setFiles: (fileList) => {
        if (!fileList) {
            set({ files: null })
            return
        }
        set({ files: Array.from(fileList) })
    },

    clearFiles: () => {
        set({ files: null, overallProgress: 0, uploading: false })
    },

    reset: () => {
        // Abort all active uploads
        Object.values(get().uploadInstances).forEach(upload => upload.abort())

        set({
            files: null,
            uploading: false,
            overallProgress: 0,
            timestampFolder: null,
            uploadInstances: {},
            uploadStatuses: {},
            completedUploads: {},
            autoS3Path: null,
        })
    },

    pauseUpload: (fileName) => {
        const upload = get().uploadInstances[fileName]
        if (upload) {
            upload.abort()
            set(state => ({
                uploadStatuses: {
                    ...state.uploadStatuses,
                    [fileName]: { ...state.uploadStatuses[fileName], status: 'paused' }
                }
            }))
        }
    },

    resumeUpload: (fileName) => {
        const upload = get().uploadInstances[fileName]
        if (upload) {
            upload.start()
            set(state => ({
                uploadStatuses: {
                    ...state.uploadStatuses,
                    [fileName]: { ...state.uploadStatuses[fileName], status: 'uploading' }
                }
            }))
        }
    },

    pauseAll: () => {
        const { uploadInstances, uploadStatuses } = get()
        if (Object.keys(uploadInstances).length === 0) return
        for (const up of Object.values(uploadInstances)) {
            try { up.abort() } catch { /* ignore */ }
        }
        const next: Record<string, FileUploadStatus> = {}
        for (const [k, v] of Object.entries(uploadStatuses)) {
            next[k] = v.status === 'uploading' ? { ...v, status: 'paused' } : v
        }
        set({ uploadStatuses: next, uploading: false })
    },

    resumeAll: () => {
        const { uploadInstances, uploadStatuses } = get()
        const paused = Object.entries(uploadStatuses).filter(
            ([, v]) => v.status === 'paused',
        )
        if (paused.length === 0) return
        const next: Record<string, FileUploadStatus> = { ...uploadStatuses }
        for (const [key, v] of paused) {
            const inst = uploadInstances[v.fileName]
            if (!inst) continue
            try {
                inst.start()
                next[key] = { ...v, status: 'uploading' }
            } catch (err) {
                console.warn('Failed to resume tus upload', v.fileName, err)
            }
        }
        set({ uploadStatuses: next, uploading: true })
    },

    cancelUpload: (fileName) => {
        const upload = get().uploadInstances[fileName]
        if (upload) {
            upload.abort()

            const newInstances = { ...get().uploadInstances }
            const newStatuses = { ...get().uploadStatuses }
            delete newInstances[fileName]
            delete newStatuses[fileName]

            set({
                uploadInstances: newInstances,
                uploadStatuses: newStatuses
            })

            if (Object.keys(newInstances).length === 0) {
                set({ uploading: false, overallProgress: 0 })
            }
        }
    },

    startUpload: async (s3UploadPath) => {
        const { files, uploading } = get()
        if (!files || files.length < 2 || uploading) return

        set({ uploading: true, timestampFolder: null, completedUploads: {}, uploadStatuses: {}, autoS3Path: null })

        // Generate shared timestamp folder
        const now = new Date()
        const sharedTimestampFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`

        set({ timestampFolder: sharedTimestampFolder })

        const totalFiles = files.length

        // Process files sequentially
        for (let i = 0; i < totalFiles; i++) {
            const file = files[i]

            try {
                await new Promise<void>((resolve, reject) => {
                    const upload = new tus.Upload(file, {
                        endpoint: '/api/tus-upload',
                        metadata: {
                            filename: file.name,
                            filetype: file.type || 'application/octet-stream',
                        },
                        headers: {
                            'x-s3-bucket-url': s3UploadPath,
                            'x-timestamp-folder': sharedTimestampFolder,
                        },
                        chunkSize: TUS_CHUNK_SIZE_BYTES,
                        retryDelays: [0, 1000, 3000, 5000],
                        onError: (error) => {
                            console.error('Upload Error:', error)
                            set(state => ({
                                uploadStatuses: {
                                    ...state.uploadStatuses,
                                    [file.name]: { ...state.uploadStatuses[file.name], status: 'error', error: error.message }
                                }
                            }))
                            toast.error(`Upload failed: ${file.name}\n${error.message}`)
                            reject(error)
                        },
                        onProgress: (bytesUploaded, bytesTotal) => {
                            const progress = Math.round((bytesUploaded / bytesTotal) * 100)

                            set(state => ({
                                uploadStatuses: {
                                    ...state.uploadStatuses,
                                    [file.name]: {
                                        fileName: file.name,
                                        progress,
                                        status: 'uploading',
                                        size: file.size
                                    }
                                }
                            }))

                            // Calculate overall progress
                            const completedCount = i
                            const totalProgress = ((completedCount + (progress / 100)) / totalFiles) * 100
                            set({ overallProgress: Math.round(totalProgress) })
                        },
                        onSuccess: async () => {
                            set(state => ({
                                uploadStatuses: {
                                    ...state.uploadStatuses,
                                    [file.name]: { ...state.uploadStatuses[file.name], progress: 100, status: 'completed' }
                                }
                            }))

                            const uploadId = upload.url?.split('/').pop()
                            if (uploadId) {
                                // Try to get S3 path info
                                try {
                                    const response = await fetch(`/api/tus-upload/${uploadId}`, {
                                        method: 'HEAD',
                                        headers: { 'Tus-Resumable': '1.0.0' }
                                    })
                                    if (response.ok) {
                                        const s3Url = response.headers.get('S3-Url')
                                        const folderPath = response.headers.get('Folder-Path')
                                        if (s3Url && folderPath) {
                                            set(state => ({
                                                completedUploads: {
                                                    ...state.completedUploads,
                                                    [file.name]: { fileName: file.name, s3Url, folderPath }
                                                }
                                            }))
                                        }
                                    }
                                } catch (e) {
                                    console.warn('Failed to fetch completion info', e)
                                }
                            }
                            resolve()
                        }
                    })

                    set(state => ({
                        uploadInstances: { ...state.uploadInstances, [file.name]: upload }
                    }))

                    upload.start()
                })
            } catch (err) {
                console.error(`Batch item ${i} failed`, err)
                // Continue with next file to not block the whole batch
            }
        }

        // Finished entire batch
        const completedList = Object.values(get().completedUploads)
        if (completedList.length > 0) {
            const firstCompleted = completedList[0]
            const finalS3Path = `s3://epicode-neoantigen/${firstCompleted.folderPath}`
            set({ autoS3Path: finalS3Path, uploading: false })
            toast.success(`${completedList.length} files uploaded successfully!`)
        } else {
            set({ uploading: false })
        }
    }
}))
