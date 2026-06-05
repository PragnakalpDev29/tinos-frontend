import { create } from 'zustand'
import * as tus from 'tus-js-client'
import toast from 'react-hot-toast'
import { TUS_CHUNK_SIZE_BYTES } from '@/lib/constants/tus-upload'

// Upload store dedicated to m6A / MeRIP-seq BAM uploads.
//
// Why a dedicated store (and not `useUploadStore`)?
//   - m6A needs TWO groups of files (baseline/ + intervention/) that share one
//     timestamped folder. The preprocessing store assumes a single flat set.
//   - We want uploads to continue when the user navigates away from the m6A
//     page, just like preprocessing does. Holding tus instances inside this
//     global Zustand store (rather than in the component's React state) makes
//     that trivially true — the component can unmount without aborting.
//
// Path layout (created on every submission, never reused):
//   s3://<AWS_BATCH_M6A_UPLOAD_BUCKET>/<AWS_BATCH_M6A_UPLOAD_PREFIX>/
//     <timestamp>/
//       baseline/     ← one subdir per group
//       intervention/
//
// The bucket + prefix are the tus-proxy's concern; this store only passes the
// prefix ('pragnakalp_m6a_uploads') plus '<timestamp>/<group>' as the shared
// folder header, matching the existing upload backend's contract.

export type M6aUploadStatusValue = 'pending' | 'uploading' | 'paused' | 'completed' | 'error'
export type M6aGroup = 'baseline' | 'intervention'

export interface M6aFileUploadStatus {
  fileName: string
  progress: number
  status: M6aUploadStatusValue
  error?: string
  size: number
  group: M6aGroup
}

export interface M6aUploadConfig {
  bucket: string           // e.g. 'epicode-neoantigen'
  pathPrefix: string       // e.g. 'pragnakalp_m6a_uploads'
}

interface M6aUploadState {
  baselineFiles: File[]
  interventionFiles: File[]

  uploading: boolean
  overallProgress: number
  timestampFolder: string | null

  uploadInstances: Record<string, tus.Upload>
  uploadStatuses: Record<string, M6aFileUploadStatus>

  autoS3Baseline: string | null
  autoS3Intervention: string | null

  setFiles: (group: M6aGroup, files: File[]) => void
  removeFile: (group: M6aGroup, index: number) => void
  clearFiles: (group?: M6aGroup) => void

  startUpload: (cfg: M6aUploadConfig) => Promise<void>
  pauseUpload: (fileName: string) => void
  resumeUpload: (fileName: string) => void
  cancelUpload: (fileName: string) => void

  // Bulk pause/resume used on logout/login so in-flight uploads are held
  // (not cancelled) while the user is signed out. Because tus instances stay
  // in memory, resumeAll() picks up each file from the exact byte it was at.
  pauseAll: () => void
  resumeAll: () => void

  reset: () => void
}

const makeSharedTimestamp = (): string => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
    `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
  )
}

const fileKey = (group: M6aGroup, fileName: string) => `${group}::${fileName}`

export const useM6aUploadStore = create<M6aUploadState>((set, get) => ({
  baselineFiles: [],
  interventionFiles: [],

  uploading: false,
  overallProgress: 0,
  timestampFolder: null,

  uploadInstances: {},
  uploadStatuses: {},

  autoS3Baseline: null,
  autoS3Intervention: null,

  setFiles: (group, files) => {
    if (group === 'baseline') {
      set({ baselineFiles: files })
    } else {
      set({ interventionFiles: files })
    }
    // Clear any prior status entries for this group so stale rows don't linger.
    set((state) => {
      const filtered: Record<string, M6aFileUploadStatus> = {}
      for (const [k, v] of Object.entries(state.uploadStatuses)) {
        if (v.group !== group) filtered[k] = v
      }
      return { uploadStatuses: filtered }
    })
  },

  removeFile: (group, index) => {
    const key = group === 'baseline' ? 'baselineFiles' : 'interventionFiles'
    const removed = get()[key][index]
    set((state) => ({
      [key]: state[key].filter((_, i) => i !== index),
    }) as Pick<M6aUploadState, 'baselineFiles' | 'interventionFiles'>)
    if (removed) {
      set((state) => {
        const next = { ...state.uploadStatuses }
        delete next[fileKey(group, removed.name)]
        return { uploadStatuses: next }
      })
    }
  },

  clearFiles: (group) => {
    if (!group) {
      set({
        baselineFiles: [],
        interventionFiles: [],
        uploadStatuses: {},
        overallProgress: 0,
      })
      return
    }
    if (group === 'baseline') set({ baselineFiles: [] })
    else set({ interventionFiles: [] })
    set((state) => {
      const next: Record<string, M6aFileUploadStatus> = {}
      for (const [k, v] of Object.entries(state.uploadStatuses)) {
        if (v.group !== group) next[k] = v
      }
      return { uploadStatuses: next }
    })
  },

  pauseUpload: (fileName) => {
    const up = get().uploadInstances[fileName]
    if (!up) return
    up.abort()
    set((state) => {
      const next = { ...state.uploadStatuses }
      for (const [k, v] of Object.entries(next)) {
        if (v.fileName === fileName) next[k] = { ...v, status: 'paused' }
      }
      return { uploadStatuses: next }
    })
  },

  resumeUpload: (fileName) => {
    const up = get().uploadInstances[fileName]
    if (!up) return
    up.start()
    set((state) => {
      const next = { ...state.uploadStatuses }
      for (const [k, v] of Object.entries(next)) {
        if (v.fileName === fileName) next[k] = { ...v, status: 'uploading' }
      }
      return { uploadStatuses: next }
    })
  },

  pauseAll: () => {
    const { uploadInstances, uploadStatuses } = get()
    const instanceCount = Object.keys(uploadInstances).length
    if (instanceCount === 0) return
    // Abort every live tus request. The Upload objects themselves stay in
    // `uploadInstances` so resumeAll() can .start() them again later and
    // they'll continue from the last acknowledged byte (tus is resumable).
    for (const up of Object.values(uploadInstances)) {
      try { up.abort() } catch { /* ignore */ }
    }
    const nextStatuses: Record<string, M6aFileUploadStatus> = {}
    for (const [k, v] of Object.entries(uploadStatuses)) {
      nextStatuses[k] = v.status === 'uploading' ? { ...v, status: 'paused' } : v
    }
    set({ uploadStatuses: nextStatuses, uploading: false })
  },

  resumeAll: () => {
    const { uploadInstances, uploadStatuses } = get()
    const paused = Object.entries(uploadStatuses).filter(
      ([, v]) => v.status === 'paused',
    )
    if (paused.length === 0) return
    const nextStatuses: Record<string, M6aFileUploadStatus> = { ...uploadStatuses }
    for (const [key, v] of paused) {
      const inst = uploadInstances[v.fileName]
      if (!inst) continue
      try {
        inst.start()
        nextStatuses[key] = { ...v, status: 'uploading' }
      } catch (err) {
        console.warn('Failed to resume tus upload', v.fileName, err)
      }
    }
    set({ uploadStatuses: nextStatuses, uploading: true })
  },

  cancelUpload: (fileName) => {
    const up = get().uploadInstances[fileName]
    if (!up) return
    up.abort()
    set((state) => {
      const insts = { ...state.uploadInstances }
      const stats = { ...state.uploadStatuses }
      delete insts[fileName]
      for (const [k, v] of Object.entries(stats)) {
        if (v.fileName === fileName) delete stats[k]
      }
      const stillActive = Object.keys(insts).length > 0
      return {
        uploadInstances: insts,
        uploadStatuses: stats,
        uploading: stillActive,
        overallProgress: stillActive ? state.overallProgress : 0,
      }
    })
  },

  reset: () => {
    Object.values(get().uploadInstances).forEach((u) => {
      try {
        u.abort()
      } catch {
        /* ignore */
      }
    })
    set({
      baselineFiles: [],
      interventionFiles: [],
      uploading: false,
      overallProgress: 0,
      timestampFolder: null,
      uploadInstances: {},
      uploadStatuses: {},
      autoS3Baseline: null,
      autoS3Intervention: null,
    })
  },

  startUpload: async (cfg) => {
    const { baselineFiles, interventionFiles, uploading } = get()
    if (uploading) return
    if (baselineFiles.length === 0 && interventionFiles.length === 0) return

    const sharedTimestamp = makeSharedTimestamp()
    set({
      uploading: true,
      overallProgress: 0,
      timestampFolder: sharedTimestamp,
      autoS3Baseline: null,
      autoS3Intervention: null,
      uploadStatuses: {},
    })

    // Overall % is computed from *bytes* across all files (not from a
    // completed-file count) so the bar moves continuously even before the
    // first file finishes. Files are sequential within each group, so at any
    // moment exactly one file per group contributes an in-flight bytesUploaded
    // value plus the sum of already-finished file sizes.
    const totalBytes =
      baselineFiles.reduce((a, f) => a + f.size, 0) +
      interventionFiles.reduce((a, f) => a + f.size, 0)
    const finishedBytes: Record<M6aGroup, number> = {
      baseline: 0,
      intervention: 0,
    }
    const inFlightBytes: Record<M6aGroup, number> = {
      baseline: 0,
      intervention: 0,
    }

    const pushOverall = () => {
      if (totalBytes <= 0) return
      const done =
        finishedBytes.baseline +
        finishedBytes.intervention +
        inFlightBytes.baseline +
        inFlightBytes.intervention
      const pct = Math.min(100, Math.round((done / totalBytes) * 100))
      set({ overallProgress: pct })
    }

    const uploadOne = (file: File, group: M6aGroup) =>
      new Promise<void>((resolve) => {
        const upload = new tus.Upload(file, {
          endpoint: '/api/tus-upload',
          metadata: {
            filename: file.name,
            filetype: file.type || 'application/octet-stream',
          },
          headers: {
            'x-s3-bucket-url': cfg.pathPrefix,
            'x-timestamp-folder': `${sharedTimestamp}/${group}`,
          },
          chunkSize: TUS_CHUNK_SIZE_BYTES,
          retryDelays: [0, 1000, 3000, 5000],
          onError: (error) => {
            set((state) => ({
              uploadStatuses: {
                ...state.uploadStatuses,
                [fileKey(group, file.name)]: {
                  fileName: file.name,
                  progress: 0,
                  status: 'error',
                  error: error.message,
                  size: file.size,
                  group,
                },
              },
            }))
            inFlightBytes[group] = 0
            toast.error(`Upload failed: ${file.name}\n${error.message}`)
            resolve() // don't block the batch on a single failure
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const progress = Math.round((bytesUploaded / bytesTotal) * 100)
            inFlightBytes[group] = bytesUploaded
            set((state) => ({
              uploadStatuses: {
                ...state.uploadStatuses,
                [fileKey(group, file.name)]: {
                  fileName: file.name,
                  progress,
                  status: 'uploading',
                  size: file.size,
                  group,
                },
              },
            }))
            pushOverall()
          },
          onSuccess: () => {
            finishedBytes[group] += file.size
            inFlightBytes[group] = 0
            set((state) => ({
              uploadStatuses: {
                ...state.uploadStatuses,
                [fileKey(group, file.name)]: {
                  fileName: file.name,
                  progress: 100,
                  status: 'completed',
                  size: file.size,
                  group,
                },
              },
            }))
            pushOverall()
            resolve()
          },
        })

        set((state) => ({
          uploadInstances: {
            ...state.uploadInstances,
            [file.name]: upload,
          },
        }))

        upload.start()
      })

    // Walk one group sequentially (preserves order inside the group) but run
    // baseline + intervention in parallel so wall time ~= the larger group.
    // The per-byte pushOverall() calls inside tus callbacks keep the global
    // bar moving smoothly without needing a per-file counter here.
    const runGroup = async (files: File[], group: M6aGroup) => {
      for (const f of files) {
        await uploadOne(f, group)
      }
    }

    try {
      await Promise.all([
        runGroup(baselineFiles, 'baseline'),
        runGroup(interventionFiles, 'intervention'),
      ])

      const base = `s3://${cfg.bucket}/${cfg.pathPrefix}/${sharedTimestamp}`
      set({
        autoS3Baseline: baselineFiles.length > 0 ? `${base}/baseline/` : null,
        autoS3Intervention:
          interventionFiles.length > 0 ? `${base}/intervention/` : null,
        uploading: false,
        overallProgress: 100,
      })

      toast.success('m6A uploads complete. S3 paths auto-filled below.')
    } catch (err) {
      console.error('m6A upload batch error:', err)
      set({ uploading: false })
      toast.error('One or more files failed to upload.')
    }
  },
}))
