'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ChevronRight, Info, Upload, X } from 'lucide-react'
import {
 jobService,
 type M6aMode,
 type M6aValidationResponse,
} from '@/lib/services/job.service'
import { useM6aUploadStore, type M6aGroup } from '@/store'

// The backend writes user-uploaded m6A BAMs under this S3 prefix.
// A shared timestamp sub-folder is created per submission so each run has a
// unique, non-colliding path. Baseline and intervention BAMs live in separate
// subdirectories under that shared folder.
const M6A_UPLOAD_BUCKET = 'epicode-neoantigen'
const M6A_UPLOAD_PATH = 'pragnakalp_m6a_uploads'

function formatFileSize(bytes: number): string {
 if (bytes === 0) return '0 Bytes'
 const k = 1024
 const sizes = ['Bytes', 'KB', 'MB', 'GB']
 const i = Math.floor(Math.log(bytes) / Math.log(k))
 return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const statusKey = (group: M6aGroup, fileName: string) => `${group}::${fileName}`

export function M6aJobForm() {
 const [jobName, setJobName] = useState('')
 // Single-script flow: dataset is chosen by input folders, not mode.
 const mode: M6aMode = 'full'
 const [s3Baseline, setS3Baseline] = useState('')
 const [s3Intervention, setS3Intervention] = useState('')

 const [isSubmitting, setIsSubmitting] = useState(false)
 const [result, setResult] = useState<{
 runTag: string
 jobId: string
 jobPk?: number
 mode: M6aMode
 s3_output: string
 script?: string
 kms_configured: boolean
 } | null>(null)

 const baselineInputRef = useRef<HTMLInputElement>(null)
 const interventionInputRef = useRef<HTMLInputElement>(null)

 // All upload state lives in the global store so uploads keep running when
 // the user navigates to a different tab/page. Matching the behavior of the
 // preprocessing (`useUploadStore`) flow.
 const {
 baselineFiles,
 interventionFiles,
 uploadStatuses,
 uploading,
 overallProgress,
 autoS3Baseline,
 autoS3Intervention,
 setFiles,
 removeFile,
 startUpload,
 clearFiles,
 reset,
 } = useM6aUploadStore()

 // Mirror auto-filled paths from the store into the local form state so the
 // user sees them land in the S3-path text boxes as soon as uploads complete.
 useEffect(() => {
 if (autoS3Baseline) setS3Baseline(autoS3Baseline)
 }, [autoS3Baseline])
 useEffect(() => {
 if (autoS3Intervention) setS3Intervention(autoS3Intervention)
 }, [autoS3Intervention])

 // ── S3-path pre-flight validation ────────────────────────────────────────
 // The backend exposes /api/validate-m6a-paths/ which scans both prefixes
 // (no Batch submission, no DB row) and reports per-side .bam counts plus
 // whether the naming convention is satisfied. We debounce-call it
 // on every path/mode change and also re-run it synchronously on Start
 // click so the user never kicks off Batch against an empty folder.
 const [validation, setValidation] = useState<M6aValidationResponse | null>(
 null,
 )
 const [validating, setValidating] = useState(false)

 useEffect(() => {
 const baseline = s3Baseline.trim()
 const intervention = s3Intervention.trim()
 if (!baseline || !intervention) {
 setValidation(null)
 return
 }
 let cancelled = false
 const handle = setTimeout(async () => {
 setValidating(true)
 try {
 const res = await jobService.validateM6aPaths({
 s3_baseline: baseline,
 s3_intervention: intervention,
 mode,
 })
 if (!cancelled) setValidation(res)
 } catch {
 // Network/auth failures fall through — Start click will
 // re-validate synchronously and surface any real error.
 if (!cancelled) setValidation(null)
 } finally {
 if (!cancelled) setValidating(false)
 }
 }, 600)
 return () => {
 cancelled = true
 clearTimeout(handle)
 }
 }, [s3Baseline, s3Intervention, mode])

 const baselineCount = baselineFiles.length
 const interventionCount = interventionFiles.length

 const allBaselineCompleted = useMemo(
 () =>
 baselineFiles.length > 0 &&
 baselineFiles.every(
 (f) => uploadStatuses[statusKey('baseline', f.name)]?.status === 'completed',
 ),
 [baselineFiles, uploadStatuses],
 )
 const allInterventionCompleted = useMemo(
 () =>
 interventionFiles.length > 0 &&
 interventionFiles.every(
 (f) => uploadStatuses[statusKey('intervention', f.name)]?.status === 'completed',
 ),
 [interventionFiles, uploadStatuses],
 )

 // Once every picked file is at 100%, hide the "Upload" button. Leaving it
 // enabled let the user click it again, which would spin up a fresh tus
 // batch under a NEW timestamp folder and re-upload all 8 files — and the
 // previously-auto-filled S3 paths would then point at the old folder
 // while the new upload landed somewhere else. Hiding it is simpler UX
 // (the next action is obviously "Start m6A Analysis") and prevents that
 // silent divergence between the paths and the bytes on disk.
 const hasAnyFiles = baselineCount > 0 || interventionCount > 0
 const allUploaded =
 hasAnyFiles &&
 (baselineCount === 0 || allBaselineCompleted) &&
 (interventionCount === 0 || allInterventionCompleted)

 const handleFilePick =
 (group: M6aGroup) => (e: React.ChangeEvent<HTMLInputElement>) => {
 if (!e.target.files || e.target.files.length === 0) return
 const picked = Array.from(e.target.files)
 const invalid = picked.filter((f) => !f.name.toLowerCase().endsWith('.bam'))
 if (invalid.length > 0) {
 toast.error(
 `Only .bam files are allowed. Invalid: ${invalid.map((f) => f.name).join(', ')}`,
 { duration: 5000 },
 )
 e.target.value = ''
 return
 }
 // Filename sanity. Warn (don't block) when picked files don't match:
 // sample_experiment_input_<rep>.bam
 // sample_experiment_ip_<rep>.bam
 // The hard gate runs server-side at pre-flight and submit time.
 const nameRe = /^[^_]+_[^_]+_(input|ip)_[0-9]+\.bam$/i
 const invalidPattern = picked.filter((f) => !nameRe.test(f.name))
 if (invalidPattern.length === picked.length) {
 toast(
 `Expected naming: sample_experiment_input_<rep>.bam or ` +
 `sample_experiment_ip_<rep>.bam. None of the ${picked.length} ` +
 `${group} file(s) match this format.`,
 { icon: '⚠️', duration: 7000, style: { maxWidth: '620px' } },
 )
 } else if (invalidPattern.length > 0) {
 toast(
 `${invalidPattern.length} of ${picked.length} ${group} file(s) ` +
 `do not match the required naming pattern.`,
 { icon: '⚠️', duration: 6000, style: { maxWidth: '560px' } },
 )
 }
 setFiles(group, picked)
 }

 const handleUploadAll = async () => {
 // m6A differential peak calling is paired by design — TRESS needs both
 // conditions to produce a contrast. Starting an upload with only one
 // side picked would give us a stray S3 folder on one side and nothing
 // on the other, and the user would then have to re-upload under a new
 // timestamp folder to pair them up. Hard-gate both groups here.
 if (baselineFiles.length === 0 || interventionFiles.length === 0) {
 toast.error(
 'Pick BAM files for both baseline/ and intervention/ before uploading.',
 )
 return
 }
 try {
 await startUpload({
 bucket: M6A_UPLOAD_BUCKET,
 pathPrefix: M6A_UPLOAD_PATH,
 })
 } catch (err) {
 console.error('m6A upload error:', err)
 }
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 const baseline = s3Baseline.trim()
 const intervention = s3Intervention.trim()
 if (!baseline || !intervention) {
 toast.error('Both baseline/ and intervention/ S3 paths are required.')
 return
 }

 setIsSubmitting(true)
 setResult(null)
 try {
 // Re-run the same pre-flight the backend submit endpoint would do,
 // but without any side effects. Catching it here gives the user a
 // clean toast + inline badges instead of a half-created DB row or
 // an ambiguous 400 fall-through. The submit endpoint still runs
 // its own validation as a safety net.
 const preflight = await jobService.validateM6aPaths({
 s3_baseline: baseline,
 s3_intervention: intervention,
 mode,
 })
 setValidation(preflight)
 if (!preflight.ok) {
 toast.error(
 preflight.error ||
 'The configured S3 paths do not match the selected mode.',
 { duration: 7000, style: { maxWidth: '560px' } },
 )
 setIsSubmitting(false)
 return
 }

 const response = await jobService.submitM6aJob({
 s3_baseline: baseline,
 s3_intervention: intervention,
 mode,
 job_name: jobName.trim() || undefined,
 })
 setResult({
 runTag: response.runTag || response.runFolder || '',
 jobId: response.jobId,
 jobPk: (response as any)?.m6a?.id,
 mode: (response.mode as M6aMode) || mode,
 s3_output: response.s3_output,
 script: response.script,
 kms_configured: response.kms_configured,
 })
 toast.success(
 `m6A job submitted!\nJob ID: ${response.jobId}\nOutput: ${response.s3_output}`,
 { duration: 6000, style: { maxWidth: '520px', whiteSpace: 'pre-line' } },
 )
 setJobName('')
 setS3Baseline('')
 setS3Intervention('')
 setValidation(null)
 reset()
 if (baselineInputRef.current) baselineInputRef.current.value = ''
 if (interventionInputRef.current) interventionInputRef.current.value = ''
 } catch (error: any) {
 const status = error?.response?.status
 const data = error?.response?.data
 let msg =
 data?.error ||
 data?.message ||
 data?.detail ||
 error?.message ||
 'Failed to submit m6A job'
 if (status === 401) {
 msg = 'Your session has expired. Please sign in again and resubmit.'
 }
 toast.error(msg, { duration: 6000 })
 } finally {
 setIsSubmitting(false)
 }
 }

 const renderFileRow = (file: File, idx: number, group: M6aGroup) => {
 const status = uploadStatuses[statusKey(group, file.name)]
 return (
 <div
 key={`${group}-${file.name}-${idx}`}
 className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-[#90BCC5]/50"
 >
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold truncate">{file.name}</p>
 <p className="text-xs text-[#08333D]">{formatFileSize(file.size)}</p>
 {status && (
 <div className="mt-1">
 <div className="w-full bg-white/50 h-1 rounded-full overflow-hidden">
 <div
 className={`h-full ${
 status.status === 'completed'
 ? 'bg-green-500'
 : status.status === 'error'
 ? 'bg-red-500'
 : 'bg-teal-500'
 }`}
 style={{ width: `${status.progress}%` }}
 />
 </div>
 <span className="text-[10px] text-[#08333D] capitalize">
 {status.status} - {status.progress}%
 {status.error ? ` · ${status.error}` : ''}
 </span>
 </div>
 )}
 </div>
 {(!status || status.status !== 'completed') && !uploading && (
 <button
 type="button"
 aria-label={`Remove ${file.name}`}
 onClick={() => removeFile(group, idx)}
 className="ml-2"
 >
 <X className="w-4 h-4 text-red-500" />
 </button>
 )}
 </div>
 )
 }

 const renderGroup = (
 title: string,
 description: string,
 group: M6aGroup,
 files: File[],
 inputRef: React.RefObject<HTMLInputElement>,
 s3Value: string,
 setS3Value: (v: string) => void,
 s3InputId: string,
 ) => {
 const groupCompleted =
 group === 'baseline' ? allBaselineCompleted : allInterventionCompleted
 return (
 <div className="bg-white/50 border border-[#90BCC5]/50 backdrop-blur-md rounded-xl p-6 space-y-5">
 <div className="flex items-center gap-3">
 <div className="h-11 w-11 bg-[#466F78] rounded-xl flex items-center justify-center text-white shadow">
 <Upload className="w-5 h-5" />
 </div>
 <div>
 <h4 className="text-base font-bold text-[#08333D]">{title}</h4>
 <p className="text-xs text-[#08333D]">{description}</p>
 </div>
 </div>

 <div className="bg-white/50 rounded-lg p-5 border border-[#90BCC5]/50 backdrop-blur-sm">
 {groupCompleted ? (
 // All files in this group are already at 100%. Showing the
 // native file picker here would let the user silently
 // replace the selection, which would blow away the
 // auto-filled S3 path for this group and leave the form
 // disconnected from where bytes actually live in S3. Show
 // a tidy "uploaded" badge instead, plus a small escape
 // hatch to clear + pick again on purpose.
 <div className="flex items-center justify-between gap-3">
 <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
 <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-900 text-green-400">
 ✓
 </span>
 {files.length} {group} file(s) uploaded
 </div>
 <button
 type="button"
 onClick={() => {
 clearFiles(group)
 if (group === 'baseline') setS3Baseline('')
 else setS3Intervention('')
 if (inputRef.current) inputRef.current.value = ''
 }}
 className="text-xs font-semibold text-[#08333D] hover:text-[#08333D] underline"
 >
 Re-select {group} files
 </button>
 </div>
 ) : (
 <>
 <label className="block text-sm font-semibold text-[#08333D] mb-2">
 Upload {group}/ folder (BAM files)
 </label>
 <input
 ref={inputRef}
 type="file"
 multiple
 accept=".bam"
 onChange={handleFilePick(group)}
 disabled={uploading}
 className="block w-full text-sm text-[#08333D] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#466F78] file:text-white cursor-pointer border-2 border-dashed border-[#90BCC5]/50 rounded-lg p-4 hover:border-teal-400"
 />
 {/* Surface strict file naming right under the picker so
 users catch issues before upload. */}
 <p className="mt-2 text-xs text-[#08333D]">
 Naming convention:{' '}
 <code className="px-1 bg-white/50 rounded">
 &lt;sample&gt;_&lt;experiment&gt;_input_&lt;rep&gt;.bam
 </code>{' '}
 and{' '}
 <code className="px-1 bg-white/50 rounded">
 &lt;sample&gt;_&lt;experiment&gt;_ip_&lt;rep&gt;.bam
 </code>
 </p>
 </>
 )}
 </div>

 {files.length > 0 && (
 <div className="space-y-2">
 {files.map((f, i) => renderFileRow(f, i, group))}
 </div>
 )}

 <div className="pt-2 border-t border-[#90BCC5]/50">
 <label
 htmlFor={s3InputId}
 className="block text-sm font-semibold text-[#08333D] mb-2"
 >
 Or {group}/ S3 path
 </label>
 <input
 id={s3InputId}
 type="text"
 value={s3Value}
 onChange={(e) => setS3Value(e.target.value)}
 placeholder={`s3://bucket/path/to/${group}/`}
 className="w-full px-4 py-2.5 bg-white/50 text-[#08333D] border border-[#90BCC5]/50 rounded-lg focus:ring-2 focus:ring-[#466F78] focus:border-transparent placeholder:text-[#08333D]/60"
 />
 {/* Inline validation badge driven by the debounced pre-flight
 call (see useEffect on s3Baseline/s3Intervention/mode). */}
 {(() => {
 const side =
 validation && group === 'baseline'
 ? validation.baseline
 : validation && group === 'intervention'
 ? validation.intervention
 : null
 const hasPath = s3Value.trim().length > 0
 if (!hasPath) return null
 if (validating && !side) {
 return (
 <p className="mt-2 text-xs text-[#08333D]">
 Checking path…
 </p>
 )
 }
 if (!side) return null
 if (side.ok) {
 return (
 <p className="mt-2 text-xs text-green-400">
 ✓ {side.total} .bam file(s) found
 {` · ${side.matched} valid-name`}
 {side.matched === 1 ? ' file' : ' files'}
 {` · ${side.paired} input/ip pair`}
 {side.paired === 1 ? '' : 's'}
 </p>
 )
 }
 return (
 <p className="mt-2 text-xs text-red-700">
 ✗ {side.error}
 </p>
 )
 })()}
 </div>
 </div>
 )
 }

 return (
 <div className="max-w-6xl mx-auto space-y-8">
 <form onSubmit={handleSubmit}>
 <div className="bg-white/50 rounded-xl shadow-sm border border-[#90BCC5]/50 p-8 space-y-6 backdrop-blur-md">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 bg-white/50 rounded-full flex items-center justify-center text-[#08333D]">
 <Info className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-xl font-bold text-[#08333D]">
 m6A / MeRIP-seq Differential Peak Analysis
 </h3>
 <p className="text-[#08333D] text-sm">
 Upload (or drag-drop){' '}
 <code className="px-1 bg-white/50 rounded">baseline/</code> and{' '}
 <code className="px-1 bg-white/50 rounded">intervention/</code> BAM
 folders, or specify S3 paths. A unique output folder is created for
 every submission. Uploads keep running in the background even if you
 switch tabs.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label
 htmlFor="m6a-job-name"
 className="block text-sm font-semibold text-[#08333D] mb-2"
 >
 Job Name <span className="text-[#08333D] ">(optional)</span>
 </label>
 <input
 id="m6a-job-name"
 type="text"
 value={jobName}
 onChange={(e) => setJobName(e.target.value)}
 className="w-full px-4 py-3 bg-white/50 text-[#08333D] border border-[#90BCC5]/50 rounded-lg focus:ring-2 focus:ring-[#466F78] transition-all placeholder:text-[#08333D]/60"
 placeholder="e.g. gsc-dmso-vs-tn01"
 />
 <p className="mt-1 text-xs text-[#08333D]">
 Prepended to the unique run tag:
 <code className="ml-1 px-1 bg-white/50 rounded">
 &lt;job-name&gt;-&lt;timestamp&gt;
 </code>
 </p>
 </div>
 </div>

 <div className="rounded-xl border border-[#466F78] bg-white/40 p-4 flex gap-3">
 <Info className="w-5 h-5 text-[#08333D] shrink-0 mt-0.5" />
 <div className="text-sm text-[#08333D] space-y-2">
 <p className="font-bold">File-name rules</p>
 <p>
 Script enforces strict naming and pairing:
 <code className="px-1 bg-white/50 rounded ml-1">
 sample_experiment_input_&lt;rep&gt;.bam
 </code>
 {' '}and{' '}
 <code className="px-1 bg-white/50 rounded">
 sample_experiment_ip_&lt;rep&gt;.bam
 </code>
 </p>
 <p className="text-xs">
 Use baseline/intervention folder paths to choose dataset.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
 {renderGroup(
 'Baseline',
 'Reference condition MeRIP-seq BAMs',
 'baseline',
 baselineFiles,
 baselineInputRef,
 s3Baseline,
 setS3Baseline,
 'm6a-s3-baseline',
 )}
 {renderGroup(
 'Intervention',
 'Treatment condition MeRIP-seq BAMs',
 'intervention',
 interventionFiles,
 interventionInputRef,
 s3Intervention,
 setS3Intervention,
 'm6a-s3-intervention',
 )}
 </div>

 {uploading && (
 <div className="bg-white/50 rounded-lg p-4 border border-[#90BCC5]/50 shadow-sm">
 <div className="flex justify-between items-center mb-2">
 <span className="text-sm font-semibold text-[#08333D]">
 Uploading…{' '}
 <span className="text-[11px] text-[#08333D] font-normal">
 (continues across pages)
 </span>
 </span>
 <span className="text-sm font-bold text-[#08333D]">
 {overallProgress}%
 </span>
 </div>
 <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
 <div
 className="bg-teal-600 h-3 rounded-full transition-all"
 style={{ width: `${overallProgress}%` }}
 />
 </div>
 </div>
 )}

 <div className="flex flex-wrap items-center gap-3 justify-between">
 <p className="text-xs text-[#08333D]">
 {baselineCount + interventionCount > 0
 ? `${baselineCount} baseline + ${interventionCount} intervention file(s) selected`
 : 'No files selected'}
 {baselineCount > 0 &&
 interventionCount === 0 &&
 !uploading ? (
 <span className="ml-2 text-amber-600 font-semibold">
 · pick intervention/ files too
 </span>
 ) : null}
 {interventionCount > 0 &&
 baselineCount === 0 &&
 !uploading ? (
 <span className="ml-2 text-amber-600 font-semibold">
 · pick baseline/ files too
 </span>
 ) : null}
 {allBaselineCompleted &&
 allInterventionCompleted &&
 baselineCount + interventionCount > 0 ? (
 <span className="ml-2 text-[#08333D] font-semibold">
 · all uploaded
 </span>
 ) : null}
 </p>
 <div className="flex gap-3">
 {!allUploaded && (
 <button
 type="button"
 onClick={handleUploadAll}
 disabled={
 uploading ||
 baselineFiles.length === 0 ||
 interventionFiles.length === 0
 }
 className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
 >
 {uploading ? (
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <Upload className="w-4 h-4" />
 )}
 {uploading
 ? 'Uploading...'
 : `Upload ${baselineCount + interventionCount} File(s)`}
 </button>
 )}
 <button
 type="submit"
 disabled={
 isSubmitting ||
 uploading ||
 // Hard-gate on the most recent debounced
 // validation result so the user cannot
 // submit against a folder we've already
 // proven empty (or missing valid
 // input/ip replicate naming). The submit
 // handler also re-validates synchronously
 // as a final safety net.
 validation?.ok === false
 }
 title={
 validation?.ok === false
 ? validation.error || undefined
 : undefined
 }
 className="px-10 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center gap-2"
 >
 {isSubmitting ? (
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <ChevronRight className="w-5 h-5" />
 )}
 Start m6A Analysis
 </button>
 </div>
 </div>
 </div>
 </form>

 {result && (
 <div className="bg-green-900/30 border border-green-500/40 rounded-xl p-6 space-y-3">
 <p className="font-semibold text-[#08333D]">m6A job submitted</p>
 <p className="text-sm text-[#08333D]">
 Job ID: <code>{result.jobId}</code>
 </p>
 <p className="text-sm text-[#08333D]">
 Mode: <code>{result.mode}</code>
 {result.script && (
 <>
 {' · Script: '}
 <code>{result.script}</code>
 </>
 )}
 </p>
 <p className="text-sm text-[#08333D] break-all">
 Run tag: <code>{result.runTag}</code>
 </p>
 <p className="text-sm text-[#08333D] break-all">
 Output path: <code>{result.s3_output}</code>
 </p>
 <p className="text-sm text-[#08333D]">
 KMS encryption:{' '}
 {result.kms_configured ? 'enabled' : 'bucket default (AES256)'}
 </p>
 <div className="flex flex-wrap gap-3 pt-2">
 {result.jobPk != null && (
 <Link
 href={`/dashboard/jobs/${result.jobPk}?type=m6a`}
 className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
 >
 View job details
 <ChevronRight className="w-4 h-4" />
 </Link>
 )}
 <Link
 href="/m6a-jobs"
 className="inline-flex items-center gap-2 px-4 py-2 bg-[#08333D] border border-teal-200 text-[#08333D] rounded-lg text-sm font-semibold hover:bg-white/50 transition-colors"
 >
 View all m6A jobs
 </Link>
 </div>
 </div>
 )}
 </div>
 )
}
