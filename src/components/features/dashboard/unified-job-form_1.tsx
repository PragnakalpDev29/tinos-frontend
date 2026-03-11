'use client'

import { useState, useRef } from 'react'
import { jobService } from '@/lib/services/job.service'
import toast from 'react-hot-toast'
import { Info, ChevronRight, AlertTriangle, Clock, Upload, X, Database, Pause, Play } from 'lucide-react'
import * as tus from 'tus-js-client'

export function UnifiedPipelineForm() {
    const [formData, setFormData] = useState({
        job_name: '',
        s3_rna_bam: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [queueFull, setQueueFull] = useState<{ message: string; running: number; queued: number } | null>(null)
    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [showUploadSection, setShowUploadSection] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadInstances, setUploadInstances] = useState<Map<string, tus.Upload>>(new Map())
    const [uploadStatuses, setUploadStatuses] = useState<Map<string, { progress: number; status: 'uploading' | 'paused' | 'completed' | 'error' }>>(new Map())
    const [completedUploads, setCompletedUploads] = useState<Map<string, { s3Url: string; folderPath: string }>>(new Map())
    const [uploadErrors, setUploadErrors] = useState<Map<string, string>>(new Map())

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files)

            // Check file type validation only
            const invalidFiles = selectedFiles.filter(file => !file.name.toLowerCase().endsWith('.bam'))

            if (invalidFiles.length > 0) {
                toast.error(
                    `Invalid file type(s) detected. Only .bam files are allowed.\nInvalid files: ${invalidFiles.map(f => f.name).join(', ')}`,
                    { duration: 5000 }
                )
                e.target.value = ''
                return
            }

            setFiles(selectedFiles)
        }
    }

    const handleFileUpload = async () => {
        if (!files || files.length === 0) {
            toast.error('Please select at least 2 BAM files to upload')
            return
        }

        if (files.length < 2) {
            toast.error('Minimum 2 BAM files required for upload')
            return
        }

        const s3UploadPath = process.env.NEXT_PUBLIC_S3_RNA_BAM_UPLOAD_PATH || 'pragnakalp_rna_bam_uploads'
        setUploading(true)
        setUploadErrors(new Map())

        const newUploadInstances = new Map<string, tus.Upload>()
        const newUploadStatuses = new Map<string, { progress: number; status: 'uploading' | 'paused' | 'completed' | 'error' }>()
        const newCompletedUploads = new Map<string, { s3Url: string; folderPath: string }>()

        // Generate a shared timestamp folder
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')
        const sharedTimestampFolder = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`

        const filesArray = Array.from(files)

        for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i]

            try {
                await new Promise<void>((resolve, reject) => {
                    const encodedFilename = btoa(file.name);

                    const upload = new tus.Upload(file, {
                        endpoint: '/api/tus-upload',
                        metadata: {
                            filename: encodedFilename,
                            filetype: file.type || 'application/octet-stream',
                        },
                        headers: {
                            'x-s3-bucket-url': s3UploadPath,
                            'x-timestamp-folder': sharedTimestampFolder,
                        },
                        chunkSize: 4 * 1024 * 1024, // 4MB chunks
                        retryDelays: [0, 1000, 3000, 5000],
                        onError: (error) => {
                            console.error('Upload failed:', error)
                            newUploadStatuses.set(file.name, { progress: 0, status: 'error' })
                            setUploadStatuses(new Map(newUploadStatuses))

                            const errorMsg = error.message || 'Unknown error'
                            const newErrors = new Map(uploadErrors)
                            newErrors.set(file.name, errorMsg)
                            setUploadErrors(newErrors)

                            toast.error(`Upload Failed: ${file.name}\n\n${errorMsg}`)
                            reject(error)
                        },
                        onProgress: (bytesUploaded, bytesTotal) => {
                            const progress = Math.round((bytesUploaded / bytesTotal) * 100)
                            newUploadStatuses.set(file.name, { progress, status: 'uploading' })
                            setUploadStatuses(new Map(newUploadStatuses))

                            const completedFiles = i
                            const currentFileProgress = progress / 100
                            const totalProgress = ((completedFiles + currentFileProgress) / filesArray.length) * 100
                            setUploadProgress(Math.round(totalProgress))
                        },
                        onSuccess: async () => {
                            newUploadStatuses.set(file.name, { progress: 100, status: 'completed' })
                            setUploadStatuses(new Map(newUploadStatuses))

                            try {
                                const uploadId = upload.url?.split('/').pop()
                                if (uploadId) {
                                    await new Promise(resolve => setTimeout(resolve, 500))

                                    let retries = 3
                                    let response = null
                                    let foundInfo = false

                                    while (retries > 0 && !foundInfo) {
                                        response = await fetch(`/api/tus-upload/${uploadId}`, {
                                            method: 'HEAD',
                                            headers: {
                                                'Tus-Resumable': '1.0.0',
                                            },
                                        })

                                        if (response.ok) {
                                            const s3Url = response.headers.get('S3-Url')
                                            const folderPath = response.headers.get('Folder-Path')

                                            if (s3Url && folderPath) {
                                                newCompletedUploads.set(file.name, { s3Url, folderPath })
                                                foundInfo = true
                                                break
                                            }
                                        }

                                        retries--
                                        if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1000))
                                    }

                                    if (!foundInfo) {
                                        const folderPath = s3UploadPath
                                        const s3Url = `s3://epicode-neoantigen/${folderPath}`
                                        newCompletedUploads.set(file.name, { s3Url, folderPath })
                                    }
                                }
                            } catch (error) {
                                const folderPath = s3UploadPath
                                const s3Url = `s3://epicode-neoantigen/${folderPath}`
                                newCompletedUploads.set(file.name, { s3Url, folderPath })
                            }
                            resolve()
                        },
                    })

                    newUploadInstances.set(file.name, upload)
                    setUploadInstances(new Map(newUploadInstances))
                    upload.start()
                })
            } catch (error) { }
        }

        if (newCompletedUploads.size > 0) {
            const firstCompleted = Array.from(newCompletedUploads.values())[0]
            const s3Path = `s3://epicode-neoantigen/${firstCompleted.folderPath}`
            setFormData(prev => ({ ...prev, s3_rna_bam: s3Path }))
            setCompletedUploads(new Map(newCompletedUploads))

            toast.success(`✓ ${files.length} file(s) uploaded successfully! RNA BAM path auto-filled.`)
            if (fileInputRef.current) fileInputRef.current.value = ''
            setShowUploadSection(false)
            setFiles([])
        }

        setUploading(false)
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const pauseUpload = (fileName: string) => {
        const upload = uploadInstances.get(fileName)
        if (upload) {
            upload.abort()
            const newStatuses = new Map(uploadStatuses)
            newStatuses.set(fileName, { ...newStatuses.get(fileName)!, status: 'paused' })
            setUploadStatuses(newStatuses)
        }
    }

    const resumeUpload = (fileName: string) => {
        const upload = uploadInstances.get(fileName)
        if (upload) {
            upload.start()
            const newStatuses = new Map(uploadStatuses)
            newStatuses.set(fileName, { ...newStatuses.get(fileName)!, status: 'uploading' })
            setUploadStatuses(newStatuses)
        }
    }

    const cancelUpload = (fileName: string) => {
        const upload = uploadInstances.get(fileName)
        if (upload) {
            upload.abort()
            const newInstances = new Map(uploadInstances)
            const newStatuses = new Map(uploadStatuses)
            newInstances.delete(fileName)
            newStatuses.delete(fileName)
            setUploadInstances(newInstances)
            setUploadStatuses(newStatuses)

            if (newInstances.size === 0) {
                setUploading(false)
                setUploadProgress(0)
            }
        }
    }

    const removeFile = (fileName: string) => {
        // If upload is in progress, cancel it first
        const upload = uploadInstances.get(fileName)
        if (upload) {
            upload.abort()
            const newInstances = new Map(uploadInstances)
            const newStatuses = new Map(uploadStatuses)
            const newErrors = new Map(uploadErrors)
            newInstances.delete(fileName)
            newStatuses.delete(fileName)
            newErrors.delete(fileName)
            setUploadInstances(newInstances)
            setUploadStatuses(newStatuses)
            setUploadErrors(newErrors)

            if (newInstances.size === 0) {
                setUploading(false)
                setUploadProgress(0)
            }
        }

        // Remove file from the list
        const newFiles = files.filter(file => file.name !== fileName)
        setFiles(newFiles)

        // Reset file input if no files left
        if (newFiles.length === 0 && fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.s3_rna_bam) {
            toast.error('RNA BAM Path is required')
            return
        }

        setIsSubmitting(true)
        setQueueFull(null)
        try {
            const response = await jobService.submitPreprocessingJob(formData)
            toast.success(
                <div>
                    <p className="font-bold">Pipeline Started!</p>
                    <p className="text-sm">Job ID: {response.jobId}</p>
                </div>,
                { duration: 6000 }
            )
            setFormData({ job_name: '', s3_rna_bam: '' })
        } catch (error: any) {
            const errData = error?.response?.data
            if (errData?.error === 'queue_full') {
                setQueueFull({
                    message: errData.message,
                    running: errData.running ?? 0,
                    queued: errData.queued ?? 0,
                })
            } else {
                toast.error(errData?.error || errData?.message || error?.message || 'Failed to start pipeline')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const jobNamePlaceholder = formData.job_name || 'auto-YYYYMMDD-HHMMSS'

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {queueFull && (
                <div className="flex items-start gap-4 bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-sm">
                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                    <div className="flex-1">
                        <p className="font-semibold text-amber-900 text-base">Compute Queue is Full</p>
                        <p className="text-sm text-amber-800 mt-1">{queueFull.message}</p>
                        <div className="flex items-center gap-4 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                {queueFull.running} Running
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                                <Clock className="w-3 h-3" />
                                {queueFull.queued} Waiting
                            </span>
                        </div>
                    </div>
                    <button onClick={() => setQueueFull(null)} className="text-amber-400 hover:text-amber-600 font-bold text-xl leading-none">×</button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                            <Info className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Launch Pipeline</h3>
                            <p className="text-slate-500 text-sm">Fill in the job details to start processing.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Name (Optional)</label>
                            <input type="text" name="job_name" value={formData.job_name} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" placeholder="e.g. run-1" />
                            <p className="mt-1.5 text-xs text-slate-500">Defaults to {jobNamePlaceholder}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">S3 RNA BAM Path <span className="text-red-500">*</span></label>
                            <input type="text" name="s3_rna_bam" value={formData.s3_rna_bam} onChange={handleInputChange} required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" placeholder="s3://..." />
                        </div>
                    </div>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center"><span className="bg-white px-4 text-sm font-bold text-slate-400 uppercase">Or</span></div>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl p-6 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Upload className="w-6 h-6" /></div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900">Upload RNA BAM Files</h4>
                                <p className="text-xs text-slate-600">Using Tus resumable uploads for better reliability.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-5 border border-teal-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-teal-500">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Select Files (Min 2 required)</label>
                            <input ref={fileInputRef} type="file" multiple accept=".bam" onChange={handleFileChange} disabled={uploading} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-teal-400" />
                            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1"><Info className="w-3 h-3" /> Resumable upload used for all file sizes.</p>
                        </div>

                        {uploading && (
                            <div className="bg-white rounded-lg p-4 border border-teal-100 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
                                    <span className="text-sm font-bold text-teal-600">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                    <div className="bg-teal-600 h-3 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            </div>
                        )}

                        {files && files.length > 0 && (
                            <div className="mt-5 space-y-2">
                                {Array.from(files).map((file, index) => {
                                    const status = uploadStatuses.get(file.name)
                                    return (
                                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Database className="w-4 h-4 text-teal-600 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                                                    {status && (
                                                        <div className="w-full bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                                                            <div className={`h-full transition-all ${status.status === 'completed' ? 'bg-green-500' : status.status === 'error' ? 'bg-red-500' : 'bg-teal-500'}`} style={{ width: `${status.progress}%` }}></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 ml-4 shadow-sm">
                                                {status?.status === 'uploading' && <button type="button" onClick={() => pauseUpload(file.name)} className="p-1 px-2 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"><Pause className="w-3.5 h-3.5" /></button>}
                                                {status?.status === 'paused' && <button type="button" onClick={() => resumeUpload(file.name)} className="p-1 px-2 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"><Play className="w-3.5 h-3.5" /></button>}
                                                {status?.status !== 'completed' && <button type="button" onClick={() => removeFile(file.name)} className="p-1 px-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"><X className="w-3.5 h-3.5" /></button>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <div className="flex justify-end mt-5">
                            <button type="button" onClick={handleFileUpload} disabled={uploading || !files || files.length < 2} className="px-8 py-3 bg-teal-600 text-white rounded-lg font-bold text-sm hover:bg-teal-700 shadow-md transition-all flex items-center gap-2">
                                {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                                {uploading ? 'Processing Tus...' : `Upload ${files?.length || ''} BAMs`}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={isSubmitting || uploading} className="px-10 py-3.5 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center gap-2">
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                            Start Pipeline
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
