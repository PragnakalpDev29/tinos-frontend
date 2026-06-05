'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, CheckCircle, XCircle, Loader2, GitBranch, Clock, AlertTriangle, FlaskConical, ExternalLink, Download, FolderOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useJobStatusWebSocket } from '@/hooks/use-job-status-websocket'
import { jobService, ArcasHlaJobData } from '@/lib/services/job.service'
import axios from 'axios'

interface JobData {
 id: number
 job_id: string
 job_name?: string
 run_name?: string
 job_type?: 'SINGLE' | 'ARRAY'
 status: string
 file_count?: number
 cores?: number
 instance_type?: string
 memory_mb?: number
 est_time?: string
 created_at: string
 updated_at: string
 s3_rna_bam?: string
 s3_deg_bam?: string
 s3_deg_jr?: string
 s3_gtex?: string
 s3_gencode?: string
 s3_output_bucket?: string
 s3_hla_output?: string
 s3_rna_bam_output?: string
 s3_logs_bucket?: string
 s3_deg_bam_consolidated?: string
 s3_consolidated_rna_bam?: string
 s3_reference_data?: string
 s3_proteomics_validation?: string
 s3_output?: string
 s3_logs?: string
 output_layout?: {
 layout?: string
 root?: string
 master_log?: string
 consensus_hla?: string
 hla_parent?: string
 arcas_hla_output?: string
 arcas_hla_summary_tsv?: string
 arcas_hla_processing_log?: string
 arcas_hla_genotype_template?: string
 optitype_output_root?: string
 optitype_result_template?: string
 deg_output?: string
 deg_skipped?: boolean
 }
 failure_reason?: string | null
 linked_arcas_hla?: ArcasHlaJobData | null
 // m6A-specific fields (populated when jobType === 'm6a')
 mode?: string
 run_folder?: string
 s3_baseline?: string
 s3_intervention?: string
 baseline_file_count?: number
 intervention_file_count?: number
 job_queue?: string
 job_definition?: string
}

interface ChildJob {
 child_index: number
 job_id: string
 label: string
 status: string
 updated_at: string
 failure_reason?: string | null
}

const STATUS_CONFIG: Record<string, {
 progress: number
 color: string
 bgColor: string
 textColor: string
 borderColor: string
 label: string
}> = {
 SUBMITTED: { progress: 10, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200', label: 'Submitted' },
 PENDING: { progress: 25, color: 'bg-slate-500 ', bgColor: 'bg-[#08333D]', textColor: 'text-[#08333D]', borderColor: 'border-[#466F78]/30', label: 'Pending' },
 RUNNABLE: { progress: 40, color: 'bg-cyan-500', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700', borderColor: 'border-cyan-200', label: 'Runnable' },
 STARTING: { progress: 60, color: 'bg-indigo-500', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700', borderColor: 'border-indigo-200', label: 'Starting' },
 RUNNING: { progress: 80, color: 'bg-amber-500', bgColor: 'bg-amber-100', textColor: 'text-amber-700', borderColor: 'border-amber-200', label: 'Running' },
 SUCCEEDED: { progress: 100, color: 'bg-green-500', bgColor: 'bg-green-900', textColor: 'text-emerald-700', borderColor: 'border-green-200', label: 'Succeeded' },
 FAILED: { progress: 100, color: 'bg-red-500', bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200', label: 'Failed' },
 PENDING_PREPROCESSING: { progress: 0, color: 'bg-indigo-400', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600', borderColor: 'border-indigo-100', label: 'Staged (Waiting for Prep)' },
}

function StatusIcon({ status }: { status: string }) {
 if (status === 'SUCCEEDED') return <CheckCircle className="w-4 h-4 text-green-600" />
 if (status === 'FAILED') return <XCircle className="w-4 h-4 text-red-600" />
 return <Loader2 className="w-4 h-4 animate-spin" />
}

interface JobDetailsContentProps {
 jobId: string
 jobType: string
}

export function JobDetailsContent({ jobId, jobType }: JobDetailsContentProps) {
 const router = useRouter()
 const [activeJobType, setActiveJobType] = useState<string>(jobType)
 const [copiedPath, setCopiedPath] = useState<string | null>(null)
 const [downloadingPath, setDownloadingPath] = useState<string | null>(null)
 const [browseModal, setBrowseModal] = useState<{ path: string; files: {name:string;size:number;url:string}[] } | null>(null)
 const [job, setJob] = useState<JobData | null>(null)
 const [children, setChildren] = useState<ChildJob[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [linkedNeoJob, setLinkedNeoJob] = useState<any | null>(null)
 const [isLinkedNeoJobLoading, setIsLinkedNeoJobLoading] = useState(false)
 const childPollRef = useRef<NodeJS.Timeout | null>(null)
 const neoPollRef = useRef<NodeJS.Timeout | null>(null)
 const jobPollRef = useRef<NodeJS.Timeout | null>(null)

 const fetchJob = useCallback(async (options?: { silent?: boolean }) => {
 const silent = options?.silent === true
 const fetchByType = async (type: string) => {
 if (type === 'neoantigen') return jobService.getNeoantigenJobById(jobId)
 if (type === 'm6a') return jobService.getM6aJobById(jobId)
 return jobService.getPreprocessingJobById(jobId)
 }
 try {
 if (!silent) setIsLoading(true)
 const requestedType = activeJobType || jobType
 let data: any
 let resolvedType = requestedType
 try {
 data = await fetchByType(requestedType)
 } catch (e: any) {
 const status = e?.response?.status
 if (status !== 404) throw e
 const fallbackTypes = ['m6a', 'preprocessing', 'neoantigen'].filter(
 (t) => t !== requestedType,
 )
 let found = false
 for (const t of fallbackTypes) {
 try {
 data = await fetchByType(t)
 resolvedType = t
 found = true
 break
 } catch (fallbackErr: any) {
 if (fallbackErr?.response?.status !== 404) throw fallbackErr
 }
 }
 if (!found) throw e
 }
 if (resolvedType !== activeJobType) setActiveJobType(resolvedType)
 setJob(data)
 } catch (error) {
 const status = (error as any)?.response?.status
 if (status === 401 || status === 403) {
 try {
 const { signOut } = await import('next-auth/react')
 await signOut({ callbackUrl: '/login' })
 } catch {
 router.replace('/login')
 }
 return
 }
 console.error('Failed to fetch job details:', error)
 } finally {
 if (!silent) setIsLoading(false)
 }
 }, [activeJobType, jobId, jobType, router])

 useEffect(() => {
 setActiveJobType(jobType)
 }, [jobType])

 const isTerminalStatus = useCallback((status?: string) => {
 if (!status) return false
 return status === 'SUCCEEDED' || status === 'FAILED'
 }, [])

 const fetchChildren = useCallback(async () => {
 if (activeJobType !== 'preprocessing') return
 try {
 // Create axios instance with session auth for this request
 const api = axios.create({
 baseURL: '/',
 timeout: 30000,
 })
 
 // Attach Bearer token from session
 const { getSession } = await import('next-auth/react')
 const session = await getSession()
 const token = (session as any)?.access || session?.user?.access
 if (token) {
 api.defaults.headers.common['Authorization'] = `Bearer ${token}`
 }
 
 const res = await api.get(
 `/proxy/api/submit-preprocessing/${jobId}/children/`
 )
 setChildren(res.data)
 } catch {
 // silently ignore
 }
 }, [activeJobType, jobId])

 useEffect(() => {
 fetchJob()
 }, [fetchJob])

 // Poll the main job as a fallback in case websocket drops.
 useEffect(() => {
 if (jobPollRef.current) {
 clearInterval(jobPollRef.current)
 jobPollRef.current = null
 }

 if (!job || isTerminalStatus(job.status)) return

 jobPollRef.current = setInterval(() => {
 fetchJob({ silent: true })
 }, 10_000)

 return () => {
 if (jobPollRef.current) clearInterval(jobPollRef.current)
 }
 }, [fetchJob, isTerminalStatus, job])

 // Fetch linked neoantigen job for preprocessing view — uses dedicated backend endpoint
 const fetchLinkedNeoJob = useCallback(async (isInitial = false) => {
 if (isInitial) setIsLinkedNeoJobLoading(true)
 try {
 const neo = await jobService.getLinkedNeoantigenJob(jobId)
 setLinkedNeoJob(neo)
 } catch {
 // silently ignore
 } finally {
 if (isInitial) setIsLinkedNeoJobLoading(false)
 }
 }, [jobId])

 useEffect(() => {
 if (activeJobType !== 'preprocessing') return
 fetchLinkedNeoJob(true)
 neoPollRef.current = setInterval(() => fetchLinkedNeoJob(false), 15_000)
 return () => { if (neoPollRef.current) clearInterval(neoPollRef.current) }
 }, [activeJobType, fetchLinkedNeoJob])

 useEffect(() => {
 if (activeJobType !== 'preprocessing') return
 fetchChildren()
 childPollRef.current = setInterval(fetchChildren, 10_000)
 return () => { if (childPollRef.current) clearInterval(childPollRef.current) }
 }, [activeJobType, fetchChildren])

 const handleStatusUpdate = useCallback((update: { job_id: string; status: string; updated_at: string }) => {
 if (job && job.job_id === update.job_id) {
 setJob(prevJob => prevJob ? { ...prevJob, status: update.status, updated_at: update.updated_at } : null)
 }
 // Also update linked neo job status if its job_id matches
 setLinkedNeoJob((prev: any) => {
 if (prev && prev.job_id === update.job_id) {
 return { ...prev, status: update.status, updated_at: update.updated_at }
 }
 return prev
 })
 setChildren(prev => prev.map(c =>
 c.job_id === update.job_id ? { ...c, status: update.status, updated_at: update.updated_at } : c
 ))
 }, [job])

 useJobStatusWebSocket({ onStatusUpdate: handleStatusUpdate, autoConnect: true })

 if (isLoading) {
 return (
 <div className="flex flex-col items-center justify-center py-24 gap-4">
 <Loader2 className="w-12 h-12 text-[#08333D] animate-spin" />
 <p className="text-[#08333D] font-medium">Loading job details...</p>
 </div>
 )
 }

 if (!job) {
 return (
 <div className="space-y-6">
 <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-[#08333D] hover:text-[#08333D] transition-colors">
 <ArrowLeft className="w-4 h-4" />
 Back to Dashboard
 </button>
 <div className="text-center py-12">
 <h2 className="text-2xl font-bold text-[#08333D]">Job Not Found</h2>
 <p className="text-[#08333D] mt-2">The requested job could not be found.</p>
 </div>
 </div>
 )
 }

 const currentStatus = STATUS_CONFIG[job.status] || STATUS_CONFIG.SUBMITTED

 const s3Paths = activeJobType === 'neoantigen'
 ? [
 { label: 'Consolidated RNA BAM', value: job.s3_consolidated_rna_bam },
 { label: 'HLA Output', value: job.s3_hla_output },
 { label: 'Reference Data', value: job.s3_reference_data },
 { label: 'Proteomics Validation', value: job.s3_proteomics_validation },
 { label: 'Output Directory', value: job.s3_output },
 { label: 'Logs Directory', value: job.s3_logs },
 ].filter(p => !!p.value)
 : activeJobType === 'm6a'
 ? [
 { label: 'Baseline Input', value: job.s3_baseline },
 { label: 'Intervention Input', value: job.s3_intervention },
 { label: 'Output Directory', value: job.s3_output },
 { label: 'Logs Directory', value: job.s3_logs },
 ].filter(p => !!p.value)
 : [
 { label: 'RNA BAM Input', value: job.s3_rna_bam },
 { label: 'Output Root (OUTPUT_S3)', value: job.output_layout?.root || job.s3_output_bucket },
 { label: 'Consensus HLA', value: job.output_layout?.consensus_hla },
 { label: 'arcasHLA Output', value: job.output_layout?.arcas_hla_output || job.s3_hla_output },
 { label: 'arcasHLA Summary TSV', value: job.output_layout?.arcas_hla_summary_tsv },
 { label: 'OptiType Output Root', value: job.output_layout?.optitype_output_root },
 { label: 'OptiType Result Template', value: job.output_layout?.optitype_result_template },
 ...(job.output_layout?.deg_output ? [{ label: 'DEG Output', value: job.output_layout.deg_output }] : []),
 // Fallback / legacy fields retained for compatibility with older records
 { label: 'Legacy RNA BAM Output', value: job.s3_rna_bam_output },
 { label: 'Legacy Logs Bucket', value: job.s3_logs_bucket },
 ...(job.s3_deg_bam_consolidated ? [{ label: 'Legacy DEG BAM Consolidated', value: job.s3_deg_bam_consolidated }] : []),
 ].filter(p => !!p.value)

 const handleCopy = async (value: string) => {
 await navigator.clipboard.writeText(value)
 setCopiedPath(value)
 setTimeout(() => setCopiedPath(null), 2000)
 }

 const handleDownload = async (s3Path: string) => {
 if (!s3Path) return
 setDownloadingPath(s3Path)
 try {
   const data = await jobService.s3Presign(s3Path)
   if (data.type === 'file') {
     window.open(data.url, '_blank')
   } else if (data.type === 'directory') {
     setBrowseModal({ path: s3Path, files: data.files || [] })
   }
 } catch (err: any) {
   console.error('Download error:', err)
   alert(err?.response?.data?.error || 'Failed to generate download link.')
 } finally {
   setDownloadingPath(null)
 }
 }

 const showChildren = activeJobType === 'preprocessing' && job.job_type === 'ARRAY' && children.length > 0

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <button
 onClick={() => router.push(activeJobType === 'm6a' ? '/m6a-jobs' : '/dashboard')}
 className="flex items-center gap-2 text-[#08333D] hover:text-[#08333D] transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 {activeJobType === 'm6a' ? 'Back to m6A Jobs' : 'Back to Dashboard'}
 </button>
 </div>

 <div>
 <h1 className="text-3xl font-bold text-[#08333D]">{job.job_name || job.run_name || job.run_folder}</h1>
 <p className="text-[#08333D] mt-2">Job ID: {job.job_id}</p>
 </div>


 {job.status === 'FAILED' && (
 <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
 <div className="flex items-start gap-3">
 <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
 <div className="flex-1">
 <h3 className="text-lg font-semibold text-red-900">Job Failed</h3>
 {job.failure_reason ? (
 <>
 <p className="text-sm text-red-700 mt-1 font-medium">Reason:</p>
 <p className="text-sm text-red-800 mt-0.5 font-mono bg-red-100 rounded px-3 py-2 break-words">
 {job.failure_reason}
 </p>
 <p className="text-xs text-red-500 mt-2">
 Check the S3 logs bucket for detailed container output.
 </p>
 </>
 ) : (
 <p className="text-sm text-red-700 mt-1">
 This job encountered an error during processing. Check the logs for details.
 </p>
 )}
 </div>
 </div>
 </div>
 )}

 {job.status === 'SUCCEEDED' && (
 <div className="bg-emerald-50/80 border-l-4 border-emerald-500 p-4 rounded-lg">
 <div className="flex items-start gap-3">
 <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
 <div className="flex-1">
 <h3 className="text-lg font-semibold text-emerald-900 font-bold">Job Completed Successfully</h3>
 <p className="text-sm text-emerald-800 font-medium mt-1">
 All processing steps completed without errors. Output files are available in the specified S3 buckets.
 </p>
 </div>
 </div>
 </div>
 )}

 {job.status === 'PENDING_PREPROCESSING' && (
 <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-lg">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 mt-0.5">
 <Clock className="w-6 h-6 text-amber-500 animate-pulse" />
 </div>
 <div className="flex-1">
 <h3 className="text-lg font-semibold text-amber-900">Waiting for Preprocessing to Complete</h3>
 <p className="text-sm text-amber-700 mt-1">
 Stage 1 (Preprocessing) is still running. This Neoantigen job has been queued and will
 start automatically once preprocessing succeeds.
 </p>
 <div className="mt-3 flex items-center gap-2">
 <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
 <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block"></span>
 Pending — Stage 2 not yet started
 </span>
 </div>
 </div>
 </div>
 </div>
 )}

 {job.status !== 'FAILED' && job.status !== 'SUCCEEDED' && (
 <Card variant="elevated">
 <CardContent className="p-6">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-3">
 <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${currentStatus.bgColor} ${currentStatus.textColor} ${currentStatus.borderColor}`}>
 <StatusIcon status={job.status} />
 {currentStatus.label}
 </span>
 {job.status !== 'PENDING_PREPROCESSING' && (
 <span className="text-sm font-medium text-[#08333D]">
 {currentStatus.progress}% Complete
 </span>
 )}
 </div>
 </div>

 {job.status === 'PENDING_PREPROCESSING' ? (
 <>
 <div className="relative w-full h-3 bg-[#466F78]/30 rounded-full overflow-hidden mb-4">
 <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 animate-pulse rounded-full" />
 </div>
 <p className="text-xs text-indigo-600 font-medium">
 ⏳ Waiting for Stage 1 (Preprocessing) to complete before this job can start.
 </p>
 </>
 ) : (
 <>
 <div className="relative w-full h-3 bg-[#466F78]/30 rounded-full overflow-hidden mb-4">
 <div
 className={`absolute top-0 left-0 h-full ${currentStatus.color} transition-all duration-500 ease-out rounded-full`}
 style={{ width: `${currentStatus.progress}%` }}
 >
 {job.status === 'RUNNING' && (
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
 )}
 </div>
 </div>

 <div className="flex justify-between text-xs">
 {['SUBMITTED', 'PENDING', 'RUNNABLE', 'STARTING', 'RUNNING', 'SUCCEEDED'].map((s) => {
 const stepConfig = STATUS_CONFIG[s]
 const isActive = currentStatus.progress >= stepConfig.progress
 const isCurrent = job.status === s
 return (
 <div key={s} className="flex flex-col items-center gap-1">
 <div className={`w-2 h-2 rounded-full transition-colors ${isActive ? stepConfig.color : 'bg-[#466F78]'} ${isCurrent ? 'ring-2 ring-offset-2 ring-current' : ''}`}></div>
 <span className={`text-[10px] font-medium ${isActive ? 'text-[#08333D]' : 'text-[#08333D] '}`}>
 {stepConfig.label}
 </span>
 </div>
 )
 })}
 </div>
 </>
 )}
 </CardContent>
 </Card>
 )}

 {showChildren && (
 <Card variant="elevated">
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <GitBranch className="w-5 h-5 text-purple-600" />
 Child Jobs
 <span className="ml-1 text-sm font-normal text-[#08333D]">({children.length} files)</span>
 {children.some(c => c.status === 'FAILED') && (
 <span className="ml-auto text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
 ⚠ {children.filter(c => c.status === 'FAILED').length} failed
 </span>
 )}
 </CardTitle>
 </CardHeader>
 <CardContent>
 {children.some(c => c.status === 'FAILED') && (
 <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-lg flex items-start gap-3">
 <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
 <div>
 <p className="text-sm font-semibold text-red-900">
 {children.filter(c => c.status === 'FAILED').length} child job(s) failed
 </p>
 <p className="text-xs text-red-700 mt-0.5">
 Neoantigen pipeline will <strong>not</strong> be auto-triggered — all child jobs must succeed first.
 </p>
 </div>
 </div>
 )}

 <div className="space-y-4">
 {children.map((child) => {
 const cfg = STATUS_CONFIG[child.status] || STATUS_CONFIG.SUBMITTED
 const isDone = child.status === 'SUCCEEDED' || child.status === 'FAILED'
 return (
 <div key={child.child_index} className={`rounded-lg border p-3 ${child.status === 'FAILED' ? 'bg-red-50 border-red-200' : 'bg-white/75 border-[#90BCC5]/50'
 }`}>
 <div className="flex items-center gap-4">
 <div className="w-20 flex-shrink-0">
 <span className="text-sm font-semibold text-[#08333D]">{child.label}</span>
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}>
 <StatusIcon status={child.status} />
 {cfg.label}
 </span>
 <span className="text-xs text-[#08333D] truncate font-mono" title={child.job_id}>{child.label}</span>
 </div>
 <div className="relative w-full h-2 bg-[#466F78]/30 rounded-full overflow-hidden">
 <div
 className={`absolute top-0 left-0 h-full ${cfg.color} transition-all duration-500 rounded-full ${!isDone ? 'animate-pulse' : ''}`}
 style={{ width: `${cfg.progress}%` }}
 />
 </div>
 </div>

 <div className="w-10 text-right flex-shrink-0">
 <span className="text-sm font-semibold text-[#08333D]">{cfg.progress}%</span>
 </div>
 </div>

 {child.status === 'FAILED' && child.failure_reason && (
 <div className="mt-2 ml-24 text-xs font-mono text-red-800 bg-red-100 rounded px-2 py-1.5 break-words">
 {child.failure_reason}
 </div>
 )}
 </div>
 )
 })}
 </div>
 </CardContent>
 </Card>
 )}

 {/* ── Linked HLA Job Section (preprocessing view only) ── */}
 {activeJobType === 'preprocessing' && job.linked_arcas_hla && (
 <Card variant="elevated" className="border-l-4 border-l-emerald-400">
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
 </svg>
 arcasHLA Job
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {/* Status row */}
 <div className="flex flex-wrap items-center gap-3">
 <div>
 <p className="text-xs font-medium text-[#08333D] mb-1">Job Name</p>
 <span className="font-mono text-sm text-white bg-[#08333D] px-2 py-1 rounded">
 {job.linked_arcas_hla.job_name}
 </span>
 </div>
 <div>
 <p className="text-xs font-medium text-[#08333D] mb-1">Status</p>
 {(() => {
 const cfg = STATUS_CONFIG[job.linked_arcas_hla.status] || STATUS_CONFIG.SUBMITTED
 return (
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}>
 <StatusIcon status={job.linked_arcas_hla.status} />
 {cfg.label}
 </span>
 )
 })()}
 </div>
 <div>
 <p className="text-xs font-medium text-[#08333D] mb-1">Configuration</p>
 <span className="text-sm font-medium text-[#08333D]">
 {job.linked_arcas_hla.threads} threads · {job.linked_arcas_hla.file_count} files
 </span>
 </div>
 </div>

 {/* Progress bar */}
 {(() => {
 const cfg = STATUS_CONFIG[job.linked_arcas_hla.status] || STATUS_CONFIG.SUBMITTED
 return (
 <div>
 <div className="flex justify-between text-xs text-[#08333D] mb-1">
 <span>HLA Typing Progress</span>
 <span>{cfg.progress}%</span>
 </div>
 <div className="w-full h-2 bg-[#466F78]/30 rounded-full overflow-hidden">
 <div
 className={`h-full ${cfg.color} transition-all duration-500 rounded-full`}
 style={{ width: `${cfg.progress}%` }}
 />
 </div>
 </div>
 )
 })()}

 {/* S3 paths */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
 <div className="bg-white/65 border border-[#90BCC5]/50 rounded-lg p-3">
 <p className="text-[10px] uppercase tracking-wider text-[#08333D] font-bold mb-1">Input Prefix</p>
 <code className="text-xs text-[#08333D] font-mono break-all font-medium">{job.linked_arcas_hla.s3_input_prefix}</code>
 </div>
 <div className="bg-white/65 border border-[#90BCC5]/50 rounded-lg p-3">
 <p className="text-[10px] uppercase tracking-wider text-[#08333D] font-bold mb-1">Output Prefix</p>
 <code className="text-xs text-[#08333D] font-mono break-all font-medium">{job.linked_arcas_hla.s3_output_prefix}</code>
 </div>
 <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 md:col-span-2">
 <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-1">Effective Output (Job Results)</p>
 <code className="text-xs text-emerald-700 font-mono break-all">{job.linked_arcas_hla.s3_effective_output_prefix}</code>
 <p className="text-[9px] text-emerald-600 mt-1">Contains: *.genotype.log, *.genotype.json, etc.</p>
 </div>
 </div>

 {/* Batch job details */}
 <div className="bg-white/65 border border-[#90BCC5]/50 rounded-lg p-3">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
 <div>
 <p className="text-[#08333D] font-medium mb-0.5">Batch Job ID</p>
 <code className="text-[#08333D] font-mono text-[10px]">{job.linked_arcas_hla.batch_job_id.substring(0, 8)}...</code>
 </div>
 <div>
 <p className="text-[#08333D] font-medium mb-0.5">Job Queue</p>
 <code className="text-[#08333D] font-mono text-[10px]">{job.linked_arcas_hla.job_queue}</code>
 </div>
 <div>
 <p className="text-[#08333D] font-medium mb-0.5">Job Definition</p>
 <code className="text-[#08333D] font-mono text-[10px]">{job.linked_arcas_hla.job_definition}</code>
 </div>
 <div>
 <p className="text-[#08333D] font-medium mb-0.5">Threads</p>
 <span className="text-[#08333D] font-semibold">{job.linked_arcas_hla.threads}</span>
 </div>
 </div>
 </div>

 {/* Failure reason */}
 {job.linked_arcas_hla.status === 'FAILED' && job.linked_arcas_hla.failure_reason && (
 <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
 <p className="text-xs font-semibold text-red-900 mb-1">HLA Job Failed</p>
 <p className="text-xs font-mono text-red-800 break-words">{job.linked_arcas_hla.failure_reason}</p>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 )}

 {/* ── Linked Neoantigen Job Section (preprocessing view only) ── */}
 {activeJobType === 'preprocessing' && (
 <Card variant="elevated" className="border-l-4 border-l-violet-400">
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <FlaskConical className="w-5 h-5 text-violet-600" />
 Linked Neoantigen Job (Stage 2)
 {linkedNeoJob && (
 <Link
 href={`/dashboard/jobs/${linkedNeoJob.id}?type=neoantigen`}
 className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 px-3 py-1.5 bg-violet-50 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors"
 >
 View Full Details
 <ExternalLink className="w-3.5 h-3.5" />
 </Link>
 )}
 </CardTitle>
 </CardHeader>
 <CardContent>
 {isLinkedNeoJobLoading ? (
 <div className="flex items-center gap-3 text-[#08333D] py-4">
 <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
 <p className="text-sm font-medium">Looking for linked neoantigen job…</p>
 </div>
 ) : !linkedNeoJob ? (
 <div className="flex items-center gap-3 text-[#08333D] py-4 border-2 border-dashed border-[#08333D] rounded-lg justify-center">
 <FlaskConical className="w-5 h-5 opacity-20" />
 <p className="text-sm">No linked neoantigen job found for this run.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {/* Status row */}
 <div className="flex flex-wrap items-center gap-3">
 <div>
 <p className="text-xs font-medium text-[#08333D] mb-1">Run Name</p>
 <span className="font-mono text-sm text-white bg-[#08333D] px-2 py-1 rounded">
 {linkedNeoJob.run_name}
 </span>
 </div>
 <div>
 <p className="text-xs font-medium text-[#08333D] mb-1">Status</p>
 {(() => {
 const cfg = STATUS_CONFIG[linkedNeoJob.status] || STATUS_CONFIG.SUBMITTED
 return (
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}>
 <StatusIcon status={linkedNeoJob.status} />
 {cfg.label}
 </span>
 )
 })()}
 </div>
 {linkedNeoJob.cores && (
 <div>
 <p className="text-xs font-medium text-[#08333D] mb-1">Compute</p>
 <span className="text-sm font-medium text-[#08333D]">
 {linkedNeoJob.cores} vCPUs · {linkedNeoJob.instance_type || 'm6i.32xlarge'}
 </span>
 </div>
 )}
 </div>

 {/* Progress bar */}
 {(() => {
 const cfg = STATUS_CONFIG[linkedNeoJob.status] || STATUS_CONFIG.SUBMITTED
 return (
 <div>
 <div className="flex justify-between text-xs text-[#08333D] mb-1">
 <span>Pipeline Progress</span>
 <span>{cfg.progress}%</span>
 </div>
 <div className="w-full h-2 bg-[#466F78]/30 rounded-full overflow-hidden">
 <div
 className={`h-full ${cfg.color} transition-all duration-500 rounded-full`}
 style={{ width: `${cfg.progress}%` }}
 />
 </div>
 </div>
 )
 })()}

 {/* Key S3 paths */}
 {(linkedNeoJob.s3_output || linkedNeoJob.s3_logs) && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
 {linkedNeoJob.s3_output && (
 <div className="bg-white/65 border border-[#90BCC5]/50 rounded-lg p-3">
 <p className="text-[10px] uppercase tracking-wider text-[#08333D] font-bold mb-1">Output Directory</p>
 <code className="text-xs text-[#08333D] font-mono break-all font-medium">{linkedNeoJob.s3_output}</code>
 </div>
 )}
 {linkedNeoJob.s3_logs && (
 <div className="bg-white/65 border border-[#90BCC5]/50 rounded-lg p-3">
 <p className="text-[10px] uppercase tracking-wider text-[#08333D] font-bold mb-1">Logs Directory</p>
 <code className="text-xs text-[#08333D] font-mono break-all font-medium">{linkedNeoJob.s3_logs}</code>
 </div>
 )}
 </div>
 )}

 {/* Failure reason */}
 {linkedNeoJob.status === 'FAILED' && linkedNeoJob.failure_reason && (
 <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
 <p className="text-xs font-semibold text-red-900 mb-1">Neoantigen Job Failed</p>
 <p className="text-xs font-mono text-red-800 break-words">{linkedNeoJob.failure_reason}</p>
 </div>
 )}
 </div>
 )}
 </CardContent>
 </Card>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Card variant="elevated">
 <CardHeader>
 <CardTitle className="text-lg">Job Information</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <label className="text-sm font-medium text-[#08333D]">Current Status</label>
 <div className="mt-1">
 <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${currentStatus.bgColor} ${currentStatus.textColor} ${currentStatus.borderColor}`}>
 <StatusIcon status={job.status} />
 {currentStatus.label}
 </span>
 </div>
 </div>
 <div>
 <label className="text-sm font-medium text-[#08333D]">Progress</label>
 <div className="mt-2">
 <div className="flex items-center gap-2">
 <div className="flex-1 h-2 bg-[#466F78]/30 rounded-full overflow-hidden">
 <div
 className={`h-full ${currentStatus.color} transition-all duration-500`}
 style={{ width: `${currentStatus.progress}%` }}
 ></div>
 </div>
 <span className="text-sm font-semibold text-[#08333D] min-w-[3rem] text-right">
 {currentStatus.progress}%
 </span>
 </div>
 </div>
 </div>
 {activeJobType === 'm6a' ? (
 <>
 <div>
 <label className="text-sm font-medium text-[#08333D]">Pipeline</label>
 <p className="text-[#08333D] font-medium mt-1">
 <span className="px-3 py-1 rounded text-sm font-semibold bg-teal-800 text-[#08333D]">
 m6A / MeRIP-seq Differential ({(job.mode || 'full').toUpperCase()})
 </span>
 </p>
 </div>
 {job.run_folder && (
 <div>
 <label className="text-sm font-medium text-[#08333D]">Run Tag</label>
 <p className="text-[#08333D] font-mono text-xs mt-1 break-all">
 {job.run_folder}
 </p>
 </div>
 )}
 <div>
 <label className="text-sm font-medium text-[#08333D]">BAM File Count</label>
 <p className="text-[#08333D] font-medium mt-1">
 Baseline: {job.baseline_file_count ?? 0}
 <span className="text-[#08333D] mx-2">·</span>
 Intervention: {job.intervention_file_count ?? 0}
 </p>
 </div>
 {(job.job_queue || job.job_definition) && (
 <div>
 <label className="text-sm font-medium text-[#08333D]">AWS Batch</label>
 <p className="text-[#08333D] font-mono text-xs mt-1 break-all">
 <span className="text-[#08333D]">queue:</span> {job.job_queue || '—'}
 <br />
 <span className="text-[#08333D]">definition:</span> {job.job_definition || '—'}
 </p>
 </div>
 )}
 </>
 ) : (
 <>
 <div>
 <label className="text-sm font-medium text-[#08333D]">Job Type</label>
 <p className="text-[#08333D] font-medium mt-1">
 <span className={`px-3 py-1 rounded text-sm font-semibold ${job.job_type === 'SINGLE' ? 'bg-blue-100 text-blue-700' :
 job.job_type === 'ARRAY' ? 'bg-purple-100 text-purple-700' :
 'bg-white/75 text-[#08333D]'
 }`}>
 {job.job_type || (job.cores ? `${job.cores} Cores` : 'Pipeline')}
 </span>
 </p>
 </div>
 {job.file_count !== undefined && (
 <div>
 <label className="text-sm font-medium text-[#08333D]">File Count</label>
 <p className="text-[#08333D] font-medium mt-1">{job.file_count}</p>
 </div>
 )}
 {job.instance_type && (
 <div>
 <label className="text-sm font-medium text-[#08333D]">Instance Type</label>
 <p className="text-[#08333D] font-medium mt-1 font-mono text-xs">{job.instance_type}</p>
 </div>
 )}
 </>
 )}
 </CardContent>
 </Card>

 <Card variant="elevated">
 <CardHeader>
 <CardTitle className="text-lg">
 Timestamps
 {activeJobType === 'neoantigen' && (
 <span className="ml-2 text-xs font-normal text-[#08333D] ">(Neoantigen job)</span>
 )}
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {activeJobType === 'neoantigen' && job.status === 'PENDING_PREPROCESSING' && (
 <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
 ⏳ This process is yet to be started — waiting for preprocessing (Stage 1) to complete first.
 </p>
 )}
 <div>
 <label className="text-sm font-medium text-[#08333D]">
 {activeJobType === 'neoantigen' ? 'Neoantigen Job Created' : 'Created At'}
 </label>
 <p className="text-[#08333D] mt-1">
 {new Date(job.created_at).toLocaleString('en-US', {
 year: 'numeric', month: 'short', day: 'numeric',
 hour: '2-digit', minute: '2-digit', second: '2-digit',
 })}
 </p>
 </div>
 <div>
 <label className="text-sm font-medium text-[#08333D]">
 {activeJobType === 'neoantigen' ? 'Neoantigen Job Last Updated' : 'Updated At'}
 </label>
 <p className="text-[#08333D] mt-1">
 {new Date(job.updated_at).toLocaleString('en-US', {
 year: 'numeric', month: 'short', day: 'numeric',
 hour: '2-digit', minute: '2-digit', second: '2-digit',
 })}
 </p>
 </div>
 </CardContent>
 </Card>
 </div>

 <Card variant="elevated">
 <CardHeader>
 <CardTitle className="text-lg">S3 Paths</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {s3Paths.map((path, index) => (
 <div key={index} className="border-b border-[#08333D] pb-4 last:border-0">
 <label className="text-sm font-medium text-[#08333D] block mb-2">
 {path.label}
 </label>
 <div className="flex items-center gap-2">
 <code className="flex-1 text-xs bg-white/65 px-3 py-2 rounded border border-[#90BCC5]/50 text-[#08333D] break-all">
 {path.value}
 </code>
 <button
 onClick={() => path.value && handleCopy(path.value)}
 className="px-3 py-2 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors whitespace-nowrap flex items-center gap-1"
 >
 {copiedPath === path.value ? (
 <><Check className="w-3 h-3" />Copied</>
 ) : (
 <><Copy className="w-3 h-3" />Copy</>
 )}
 </button>
 <button
 onClick={() => path.value && handleDownload(path.value)}
 disabled={downloadingPath === path.value}
 className="px-3 py-2 text-xs bg-[#466F78] text-white rounded hover:bg-[#08333D] transition-colors whitespace-nowrap flex items-center gap-1 disabled:opacity-50"
 title={path.value?.endsWith('/') ? 'Browse & download files' : 'Download file'}
 >
 {downloadingPath === path.value ? (
 <><Loader2 className="w-3 h-3 animate-spin" />Loading</>
 ) : path.value?.endsWith('/') ? (
 <><FolderOpen className="w-3 h-3" />Browse</>
 ) : (
 <><Download className="w-3 h-3" />Download</>
 )}
 </button>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* File Browse Modal */}
 {browseModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setBrowseModal(null)}>
 <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
 <div>
 <h3 className="text-base font-bold text-[#08333D]">Files in S3</h3>
 <p className="text-xs text-[#466F78] font-mono mt-0.5 break-all">{browseModal.path}</p>
 </div>
 <button onClick={() => setBrowseModal(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
 </div>
 <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
 {browseModal.files.length === 0 ? (
 <p className="text-sm text-slate-500 text-center py-8">No files found in this directory.</p>
 ) : browseModal.files.map((f, i) => (
 <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
 <div className="min-w-0 flex-1">
 <p className="text-sm font-medium text-[#08333D] truncate">{f.name}</p>
 <p className="text-xs text-[#466F78]">{f.size ? (f.size / 1024 / 1024).toFixed(2) + ' MB' : '—'}</p>
 </div>
 <a
 href={f.url}
 target="_blank"
 rel="noopener noreferrer"
 className="px-3 py-1.5 text-xs bg-[#466F78] text-white rounded hover:bg-[#08333D] transition-colors flex items-center gap-1 whitespace-nowrap"
 >
 <Download className="w-3 h-3" /> Download
 </a>
 </div>
 ))}
 </div>
 <div className="px-6 py-3 border-t border-slate-200 text-xs text-slate-400">
 {browseModal.files.length} file(s) · Download links expire in 1 hour
 </div>
 </div>
 </div>
 )}
 </div>
 )
}
