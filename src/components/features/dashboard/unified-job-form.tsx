'use client'

import { useState, useRef, useEffect } from 'react'
import { jobService, type ValidateS3Response } from '@/lib/services/job.service'
import toast from 'react-hot-toast'
import { Info, ChevronRight, AlertTriangle, Clock, Upload, X, Pause, Play, Database } from 'lucide-react'
import { useUploadStore } from '@/store'

export function UnifiedPipelineForm() {
 const [formData, setFormData] = useState({
 job_name: '',
 s3_rna_bam: '',
 })
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [queueFull, setQueueFull] = useState<{ message: string; running: number; queued: number } | null>(null)

 // Use the global upload store
 const {
 files,
 setFiles,
 uploading,
 overallProgress: uploadProgress,
 uploadStatuses,
 autoS3Path,
 startUpload,
 pauseUpload,
 resumeUpload,
 cancelUpload,
 reset
 } = useUploadStore()

 const [showUploadSection, setShowUploadSection] = useState(false)
 const fileInputRef = useRef<HTMLInputElement>(null)
 const [s3PathError, setS3PathError] = useState<string>('')

 // ── S3-path pre-flight validation (debounced) ────────────────────────────
 // Mirrors the m6A form's behavior. As soon as the user types/pastes an
 // S3 path — or one gets auto-filled from a completed tus upload — we hit
 // the backend's /api/validate-s3-path/ endpoint (no side effects, just a
 // .bam count), and render an inline badge below the field. Saves the
 // "click Submit → wait → 400 error" round-trip.
 const [pathValidation, setPathValidation] = useState<ValidateS3Response | null>(
 null,
 )
 const [pathValidating, setPathValidating] = useState(false)

 // Sync auto-filled S3 path from global store
 useEffect(() => {
 if (autoS3Path) {
 setFormData(prev => ({ ...prev, s3_rna_bam: autoS3Path }))
 }
 }, [autoS3Path])

 useEffect(() => {
 const path = formData.s3_rna_bam.trim()
 if (!path) {
 setPathValidation(null)
 return
 }
 // Skip the expensive S3 LIST until the string at least looks like an
 // s3:// URL, so we don't spam the backend on every keystroke.
 if (!/^s3:\/\/[^/]+\/.+/.test(path)) {
 setPathValidation(null)
 return
 }
 let cancelled = false
 const handle = setTimeout(async () => {
 setPathValidating(true)
 try {
 const res = await jobService.validateS3Path(path)
 if (!cancelled) setPathValidation(res)
 } finally {
 if (!cancelled) setPathValidating(false)
 }
 }, 600)
 return () => {
 cancelled = true
 clearTimeout(handle)
 }
 }, [formData.s3_rna_bam])

 const validateS3Path = (path: string): boolean => {
 if (!path) return true // Empty is valid (will be caught by required)
 const s3PathRegex = /^s3:\/\/[a-zA-Z0-9.\-_]+(\/[a-zA-Z0-9.\-_\/]*)?$/
 return s3PathRegex.test(path)
 }

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { name, value } = e.target
 setFormData(prev => ({ ...prev, [name]: value }))

 // Validate S3 path for s3_rna_bam field
 if (name === 's3_rna_bam') {
 if (value && !validateS3Path(value)) {
 setS3PathError('Invalid S3 path format. Must start with s3:// followed by bucket name and optional path')
 } else {
 setS3PathError('')
 }
 }
 }

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files.length > 0) {
 const selectedFiles = Array.from(e.target.files)
 const invalidFiles = selectedFiles.filter(file => !file.name.toLowerCase().endsWith('.bam'))

 if (invalidFiles.length > 0) {
 toast.error(
 `Invalid file type(s) detected.\nOnly .bam files are allowed.\n\nInvalid files: ${invalidFiles.map(f => f.name).join(', ')}`,
 {
 duration: 5000,
 style: {
 maxWidth: '500px',
 padding: '16px',
 fontSize: '14px',
 whiteSpace: 'pre-line',
 },
 }
 )
 e.target.value = ''
 return
 }

 setFiles(e.target.files)
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

 try {
 await startUpload(s3UploadPath)
 if (fileInputRef.current) {
 fileInputRef.current.value = ''
 }
 } catch (error) {
 console.error('Batch upload error:', error)
 }
 }

 const formatFileSize = (bytes: number) => {
 if (bytes === 0) return '0 Bytes'
 const k = 1024
 const sizes = ['Bytes', 'KB', 'MB', 'GB']
 const i = Math.floor(Math.log(bytes) / Math.log(k))
 return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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
 // Hard pre-flight: re-run the same S3 scan the backend submit
 // endpoint does, but without creating a DB row or touching Batch.
 // Catches "typed path has no BAMs yet" before we even start.
 const preflight = await jobService.validateS3Path(formData.s3_rna_bam)
 setPathValidation(preflight)
 if (!preflight.valid) {
 toast.error(
 preflight.error ||
 'No BAM files found at the specified S3 path.',
 { duration: 6000, style: { maxWidth: '520px' } },
 )
 setIsSubmitting(false)
 return
 }

 const response = await jobService.submitPreprocessingJob(formData)
 toast.success(
 `✓ Pipeline Started Successfully!\n\nJob ID: ${response.jobId}\n\nStage 2 will trigger automatically upon Stage 1 completion.`,
 {
 duration: 6000,
 style: {
 maxWidth: '500px',
 padding: '16px',
 fontSize: '14px',
 whiteSpace: 'pre-line',
 },
 }
 )
 setFormData({ job_name: '', s3_rna_bam: '' })
 setPathValidation(null)
 reset()
 if (fileInputRef.current) {
 fileInputRef.current.value = ''
 }
 } catch (error: any) {
 const errData = error?.response?.data
 if (errData?.error === 'queue_full') {
 setQueueFull({
 message: errData.message,
 running: errData.running ?? 0,
 queued: errData.queued ?? 0,
 })
 } else {
 const errorMessage = errData?.error || errData?.message || error?.message || 'Failed to start pipeline'
 toast.error(errorMessage)
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
 <div className="flex-shrink-0 mt-0.5">
 <AlertTriangle className="w-6 h-6 text-amber-500" />
 </div>
 <div className="flex-1">
 <p className="font-semibold text-amber-900 text-base">Compute Queue is Currently Full</p>
 <p className="text-sm text-amber-800 mt-1">{queueFull.message}</p>
 <div className="flex items-center gap-4 mt-3">
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
 <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
 {queueFull.running} Running
 </span>
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
 <Clock className="w-3 h-3" />
 {queueFull.queued} Waiting
 </span>
 </div>
 </div>
 <button onClick={() => setQueueFull(null)} className="text-amber-400 hover:text-amber-600 text-xl font-bold flex-shrink-0">×</button>
 </div>
 )}

 <form onSubmit={handleSubmit}>
 <div className="bg-white/20 rounded-xl shadow-sm border border-[#90BCC5]/50 p-8 space-y-6">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 bg-teal-800 rounded-full flex items-center justify-center text-[#466F78]">
 <Info className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-xl font-bold text-[#08333D]">Launch Pipeline</h3>
 <p className="text-[#466F78] text-sm">Only two inputs needed — all other paths are auto-configured.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label htmlFor="job_name" className="block text-sm font-semibold text-[#08333D] mb-2">Job Name</label>
 <input
 type="text"
 id="job_name"
 name="job_name"
 value={formData.job_name}
 onChange={handleInputChange}
 className="w-full px-4 py-3 border border-[#90BCC5]/50 rounded-lg focus:ring-2 focus:ring-teal-500 transition-all"
 placeholder="e.g. sample-a-run-1"
 />
 </div>

 <div>
 <label htmlFor="s3_rna_bam" className="block text-sm font-semibold text-[#08333D] mb-2">S3 RNA BAM Path <span className="text-red-500">*</span></label>
 <input
 type="text"
 id="s3_rna_bam"
 name="s3_rna_bam"
 value={formData.s3_rna_bam}
 onChange={handleInputChange}
 required
 className={`w-full px-4 py-3 border rounded-lg transition-all ${
 s3PathError || pathValidation?.valid === false
 ? 'border-red-500'
 : pathValidation?.valid
 ? 'border-green-500'
 : 'border-[#90BCC5]/50'
 }`}
 placeholder="s3://bucket/path/"
 />
 {s3PathError && <p className="mt-1 text-xs text-red-600">{s3PathError}</p>}
 {/* Live pre-flight badge (see useEffect on
 formData.s3_rna_bam). Hidden while the format
 regex already shows an error, since that hint
 is more actionable first. */}
 {!s3PathError && formData.s3_rna_bam.trim() && (
 <>
 {pathValidating && !pathValidation && (
 <p className="mt-1 text-xs text-[#466F78]">
 Checking S3 path…
 </p>
 )}
 {pathValidation?.valid && (
 <p className="mt-1 text-xs text-green-400">
 ✓ {pathValidation.file_count ?? 0} BAM
 file(s) found
 {pathValidation.files &&
 pathValidation.files.length > 0
 ? ` · ${pathValidation.files
 .slice(0, 3)
 .join(', ')}${
 pathValidation.files
 .length > 3
 ? ', …'
 : ''
 }`
 : ''}
 </p>
 )}
 {pathValidation && !pathValidation.valid && (
 <p className="mt-1 text-xs text-red-700">
 ✗{' '}
 {pathValidation.error ||
 'No BAM files found at this path.'}
 </p>
 )}
 </>
 )}
 </div>
 </div>

 <div className="relative my-8">
 <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-teal-200"></div></div>
 <div className="relative flex justify-center"><span className="bg-white/20 px-6 py-2 text-sm font-bold text-[#466F78] uppercase border-2 border-teal-200 rounded-full">Or</span></div>
 </div>

 <div className="bg-gradient-to-br from-teal-900/30 to-emerald-50 border-2 border-teal-200 rounded-xl p-6 space-y-5">
 <div className="flex items-center gap-3">
 <div className="h-12 w-12 bg-teal-600 rounded-xl flex items-center justify-center text-[#08333D] shadow-lg"><Upload className="w-6 h-6" /></div>
 <div>
 <h4 className="text-base font-bold text-[#08333D]">Upload RNA BAM Files</h4>
 <p className="text-xs text-[#466F78]">Supports resumable uploads for large files</p>
 </div>
 </div>

 <div className="bg-white/20 rounded-lg p-5 border border-[#90BCC5]/50">
 <input
 ref={fileInputRef}
 type="file"
 multiple
 accept=".bam"
 onChange={handleFileChange}
 disabled={uploading}
 className="block w-full text-sm text-[#466F78] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-[#08333D] cursor-pointer border-2 border-dashed border-[#90BCC5]/50 rounded-lg p-4 hover:border-teal-400"
 />
 </div>

 {uploading && (
 <div className="bg-white/20 rounded-lg p-4 border border-[#90BCC5]/50 shadow-sm">
 <div className="flex justify-between items-center mb-2">
 <span className="text-sm font-semibold text-[#08333D]">Uploading Files...</span>
 <span className="text-sm font-bold text-[#466F78]">{uploadProgress}%</span>
 </div>
 <div className="w-full bg-[#466F78]/30 rounded-full h-3 overflow-hidden">
 <div className="bg-teal-600 h-3 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
 </div>
 </div>
 )}

 {files && files.length > 0 && (
 <div className="space-y-2">
 {files.map((file, index) => {
 const status = uploadStatuses[file.name]
 return (
 <div key={index} className="flex items-center justify-between p-3 bg-white/20 rounded-lg border border-[#90BCC5]/50 group">
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold truncate">{file.name}</p>
 <p className="text-xs text-[#466F78]">{formatFileSize(file.size)}</p>
 {status && (
 <div className="mt-1">
 <div className="w-full bg-[#466F78]/30 h-1 rounded-full overflow-hidden">
 <div className={`h-full ${status.status === 'completed' ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${status.progress}%` }}></div>
 </div>
 <span className="text-[10px] text-[#466F78] capitalize">{status.status} - {status.progress}%</span>
 </div>
 )}
 </div>
 <div className="flex gap-1 ml-2">
 {status?.status === 'uploading' && <button type="button" onClick={() => pauseUpload(file.name)}><Pause className="w-4 h-4 text-yellow-500" /></button>}
 {status?.status === 'paused' && <button type="button" onClick={() => resumeUpload(file.name)}><Play className="w-4 h-4 text-green-500" /></button>}
 {(!status || status.status !== 'completed') && (
 <button type="button" onClick={() => {
 if (status) cancelUpload(file.name)
 else setFiles(files.filter((_, i) => i !== index) as any)
 }}>
 <X className="w-4 h-4 text-red-500" />
 </button>
 )}
 </div>
 </div>
 )
 })}
 </div>
 )}

 <div className="flex justify-end">
 <button
 type="button"
 onClick={handleFileUpload}
 disabled={uploading || !files || files.length < 2}
 className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
 >
 {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
 {uploading ? 'Uploading...' : `Upload ${files?.length || 0} Files`}
 </button>
 </div>
 </div>

 <div className="flex justify-end">
 <button
 type="submit"
 disabled={
 isSubmitting ||
 uploading ||
 // Hard-gate on the most recent pre-flight
 // result. The submit handler re-validates
 // synchronously as a final safety net.
 pathValidation?.valid === false
 }
 title={
 pathValidation?.valid === false
 ? pathValidation.error || undefined
 : undefined
 }
 className="px-10 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center gap-2"
 >
 {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronRight className="w-5 h-5" />}
 Start Pipeline
 </button>
 </div>
 </div>
 </form>
 </div>
 )
}
