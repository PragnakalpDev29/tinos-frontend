'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Copy, Check, CheckCircle, XCircle, Loader2, GitBranch, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useJobStatusWebSocket } from '@/hooks/use-job-status-websocket'
import { jobService } from '@/lib/services/job.service'
import { axiosClient } from '@/lib/api/axios-client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

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

  // Preprocessing Paths
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

  // Neoantigen Paths
  s3_consolidated_rna_bam?: string
  s3_reference_data?: string
  s3_proteomics_validation?: string
  s3_output?: string
  s3_logs?: string
}

interface ChildJob {
  child_index: number
  job_id: string
  label: string
  status: string
  updated_at: string
}

// Status config used both for parent and children
const STATUS_CONFIG: Record<string, {
  progress: number
  color: string
  bgColor: string
  textColor: string
  borderColor: string
  label: string
}> = {
  SUBMITTED: { progress: 10, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200', label: 'Submitted' },
  PENDING: { progress: 25, color: 'bg-slate-500', bgColor: 'bg-slate-100', textColor: 'text-slate-700', borderColor: 'border-slate-200', label: 'Pending' },
  RUNNABLE: { progress: 40, color: 'bg-cyan-500', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700', borderColor: 'border-cyan-200', label: 'Runnable' },
  STARTING: { progress: 60, color: 'bg-indigo-500', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700', borderColor: 'border-indigo-200', label: 'Starting' },
  RUNNING: { progress: 80, color: 'bg-amber-500', bgColor: 'bg-amber-100', textColor: 'text-amber-700', borderColor: 'border-amber-200', label: 'Running' },
  SUCCEEDED: { progress: 100, color: 'bg-green-500', bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200', label: 'Succeeded' },
  FAILED: { progress: 100, color: 'bg-red-500', bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200', label: 'Failed' },
  PENDING_PREPROCESSING: { progress: 0, color: 'bg-indigo-400', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600', borderColor: 'border-indigo-100', label: 'Staged (Waiting for Prep)' },
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'SUCCEEDED') return <CheckCircle className="w-4 h-4 text-green-600" />
  if (status === 'FAILED') return <XCircle className="w-4 h-4 text-red-600" />
  return <Loader2 className="w-4 h-4 animate-spin" />
}

export default function JobDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobType = searchParams.get('type') || 'preprocessing'

  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [job, setJob] = useState<JobData | null>(null)
  const [children, setChildren] = useState<ChildJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const childPollRef = useRef<NodeJS.Timeout | null>(null)

  const fetchJob = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = jobType === 'neoantigen'
        ? await jobService.getNeoantigenJobById(params.id as string)
        : await jobService.getPreprocessingJobById(params.id as string)
      setJob(data)
    } catch (error) {
      console.error('Failed to fetch job details:', error)
    } finally {
      setIsLoading(false)
    }
  }, [params.id, jobType])

  const fetchChildren = useCallback(async () => {
    if (jobType !== 'preprocessing') return
    try {
      const res = await axiosClient.get(
        `/proxy/api/submit-preprocessing/${params.id}/children/`
      )
      setChildren(res.data)
    } catch {
      // silently ignore — children may not exist yet
    }
  }, [params.id, jobType])

  useEffect(() => {
    fetchJob()
  }, [fetchJob])

  // Poll children every 10s for ARRAY jobs
  useEffect(() => {
    if (jobType !== 'preprocessing') return
    fetchChildren()
    childPollRef.current = setInterval(fetchChildren, 10_000)
    return () => { if (childPollRef.current) clearInterval(childPollRef.current) }
  }, [fetchChildren, jobType])

  // Handle real-time job status updates via WebSocket
  const handleStatusUpdate = useCallback((update: { job_id: string; status: string; updated_at: string }) => {
    if (job && job.job_id === update.job_id) {
      setJob(prevJob => prevJob ? { ...prevJob, status: update.status, updated_at: update.updated_at } : null)
    }
    // Also update children in real-time
    setChildren(prev => prev.map(c =>
      c.job_id === update.job_id ? { ...c, status: update.status, updated_at: update.updated_at } : c
    ))
  }, [job])

  useJobStatusWebSocket({ onStatusUpdate: handleStatusUpdate, autoConnect: true })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
        <p className="text-slate-600 font-medium">Loading job details...</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900">Job Not Found</h2>
          <p className="text-slate-600 mt-2">The requested job could not be found.</p>
        </div>
      </div>
    )
  }

  const currentStatus = STATUS_CONFIG[job.status] || STATUS_CONFIG.SUBMITTED

  const s3Paths = jobType === 'neoantigen'
    ? [
      { label: 'Consolidated RNA BAM', value: job.s3_consolidated_rna_bam },
      { label: 'HLA Output', value: job.s3_hla_output },
      { label: 'Reference Data', value: job.s3_reference_data },
      { label: 'Proteomics Validation', value: job.s3_proteomics_validation },
      { label: 'Output Directory', value: job.s3_output },
      { label: 'Logs Directory', value: job.s3_logs },
    ].filter(p => !!p.value)
    : [
      { label: 'RNA BAM Input', value: job.s3_rna_bam },
      { label: 'DEG BAM Input', value: job.s3_deg_bam },
      { label: 'DEG JR Input', value: job.s3_deg_jr },
      { label: 'GTEx Input', value: job.s3_gtex },
      { label: 'Gencode Input', value: job.s3_gencode },
      { label: 'Output Bucket', value: job.s3_output_bucket },
      { label: 'HLA Output', value: job.s3_hla_output },
      { label: 'RNA BAM Output', value: job.s3_rna_bam_output },
      { label: 'Logs Bucket', value: job.s3_logs_bucket },
      ...(job.s3_deg_bam_consolidated ? [{ label: 'DEG BAM Consolidated', value: job.s3_deg_bam_consolidated }] : []),
    ].filter(p => !!p.value)

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedPath(value)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  const showChildren = jobType === 'preprocessing' && job.job_type === 'ARRAY' && children.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">{job.job_name || job.run_name}</h1>
        <p className="text-slate-600 mt-2">Job ID: {job.job_id}</p>
      </div>

      {/* Failed Status Alert Banner */}
      {job.status === 'FAILED' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">Job Failed</h3>
              <p className="text-sm text-red-700 mt-1">
                This job encountered an error during processing. Please check the logs for more details or contact support if the issue persists.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Succeeded Status Banner */}
      {job.status === 'SUCCEEDED' && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900">Job Completed Successfully</h3>
              <p className="text-sm text-green-700 mt-1">
                All processing steps completed without errors. Output files are available in the specified S3 buckets.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Preprocessing Banner — neoantigen job not yet started */}
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

      {/* Progress Bar Section — hidden for terminal and pre-start states */}
      {job.status !== 'FAILED' && job.status !== 'SUCCEEDED' && job.status !== 'PENDING_PREPROCESSING' && (
        <Card variant="elevated" className="bg-slate-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${currentStatus.bgColor} ${currentStatus.textColor} ${currentStatus.borderColor}`}>
                  <StatusIcon status={job.status} />
                  {currentStatus.label}
                </span>
                <span className="text-sm font-medium text-slate-600">
                  {currentStatus.progress}% Complete
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
              <div
                className={`absolute top-0 left-0 h-full ${currentStatus.color} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${currentStatus.progress}%` }}
              >
                {job.status === 'RUNNING' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                )}
              </div>
            </div>

            {/* Status Steps */}
            <div className="flex justify-between text-xs">
              {['SUBMITTED', 'PENDING', 'RUNNABLE', 'STARTING', 'RUNNING', 'SUCCEEDED'].map((s) => {
                const stepConfig = STATUS_CONFIG[s]
                const isActive = currentStatus.progress >= stepConfig.progress
                const isCurrent = job.status === s
                return (
                  <div key={s} className="flex flex-col items-center gap-1">
                    <div className={`w-2 h-2 rounded-full transition-colors ${isActive ? stepConfig.color : 'bg-slate-300'} ${isCurrent ? 'ring-2 ring-offset-2 ring-current' : ''}`}></div>
                    <span className={`text-[10px] font-medium ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>
                      {stepConfig.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Child Jobs Progress ── */}
      {showChildren && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-600" />
              Child Jobs
              <span className="ml-1 text-sm font-normal text-slate-500">({children.length} files)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {children.map((child) => {
                const cfg = STATUS_CONFIG[child.status] || STATUS_CONFIG.SUBMITTED
                const isDone = child.status === 'SUCCEEDED' || child.status === 'FAILED'
                return (
                  <div key={child.child_index} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50">
                    {/* Label */}
                    <div className="w-20 flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-700">{child.label}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}>
                          <StatusIcon status={child.status} />
                          {cfg.label}
                        </span>
                        <span className="text-xs text-slate-400 truncate font-mono">{child.job_id}</span>
                      </div>
                      <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full ${cfg.color} transition-all duration-500 rounded-full ${!isDone ? 'animate-pulse' : ''}`}
                          style={{ width: `${cfg.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Percentage */}
                    <div className="w-10 text-right flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-600">{cfg.progress}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
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
              <label className="text-sm font-medium text-slate-600">Current Status</label>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${currentStatus.bgColor} ${currentStatus.textColor} ${currentStatus.borderColor}`}>
                  <StatusIcon status={job.status} />
                  {currentStatus.label}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Progress</label>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${currentStatus.color} transition-all duration-500`}
                      style={{ width: `${currentStatus.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 min-w-[3rem] text-right">
                    {currentStatus.progress}%
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Job Type</label>
              <p className="text-slate-900 font-medium mt-1">
                <span className={`px-3 py-1 rounded text-sm font-semibold ${job.job_type === 'SINGLE' ? 'bg-blue-100 text-blue-700' :
                  job.job_type === 'ARRAY' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                  {job.job_type || (job.cores ? `${job.cores} Cores` : 'Pipeline')}
                </span>
              </p>
            </div>
            {job.file_count !== undefined && (
              <div>
                <label className="text-sm font-medium text-slate-600">File Count</label>
                <p className="text-slate-900 font-medium mt-1">{job.file_count}</p>
              </div>
            )}
            {job.instance_type && (
              <div>
                <label className="text-sm font-medium text-slate-600">Instance Type</label>
                <p className="text-slate-900 font-medium mt-1 font-mono text-xs">{job.instance_type}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">
              Timestamps
              {jobType === 'neoantigen' && (
                <span className="ml-2 text-xs font-normal text-slate-400">(Neoantigen job)</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobType === 'neoantigen' && job.status === 'PENDING_PREPROCESSING' && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⏳ This process is yet to be started — waiting for preprocessing (Stage 1) to complete first.
              </p>
            )}
            <div>
              <label className="text-sm font-medium text-slate-600">
                {jobType === 'neoantigen' ? 'Neoantigen Job Created' : 'Created At'}
              </label>
              <p className="text-slate-900 mt-1">
                {new Date(job.created_at).toLocaleString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                {jobType === 'neoantigen' ? 'Neoantigen Job Last Updated' : 'Updated At'}
              </label>
              <p className="text-slate-900 mt-1">
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
              <div key={index} className="border-b border-slate-100 pb-4 last:border-0">
                <label className="text-sm font-medium text-slate-600 block mb-2">
                  {path.label}
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-slate-50 px-3 py-2 rounded border border-slate-200 text-slate-700 break-all">
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
