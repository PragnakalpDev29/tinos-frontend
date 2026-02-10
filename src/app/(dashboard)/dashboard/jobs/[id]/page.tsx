'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Check, Wifi, WifiOff, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useCallback, useEffect } from 'react'
import { useJobStatusWebSocket } from '@/hooks/use-job-status-websocket'
import MOCK_JOBS_DATA from '@/data/mock-jobs.json'

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [job, setJob] = useState(() => {
    const jobId = parseInt(params.id as string)
    return MOCK_JOBS_DATA.find(j => j.id === jobId) || null
  })

  // Handle real-time job status updates via WebSocket
  const handleStatusUpdate = useCallback((update: { job_id: string; status: string; updated_at: string }) => {
    if (job && job.job_id === update.job_id) {
      setJob(prevJob => prevJob ? {
        ...prevJob,
        status: update.status as any,
        updated_at: update.updated_at
      } : null)
    }
  }, [job])

  // Connect to WebSocket for real-time status updates
  const { isConnected, connectionError } = useJobStatusWebSocket({
    onStatusUpdate: handleStatusUpdate,
    autoConnect: true,
  })

  if (!job) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
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

  // Status configuration with progress percentage and colors
  const statusConfig: Record<string, { 
    progress: number
    color: string
    bgColor: string
    textColor: string
    borderColor: string
    icon: React.ReactNode
    label: string
  }> = {
    SUBMITTED: {
      progress: 10,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      label: 'Submitted'
    },
    PENDING: {
      progress: 25,
      color: 'bg-slate-500',
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-200',
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      label: 'Pending'
    },
    RUNNABLE: {
      progress: 40,
      color: 'bg-cyan-500',
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-200',
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      label: 'Runnable'
    },
    STARTING: {
      progress: 60,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200',
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      label: 'Starting'
    },
    RUNNING: {
      progress: 80,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      label: 'Running'
    },
    SUCCEEDED: {
      progress: 100,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Succeeded'
    },
    FAILED: {
      progress: 100,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      icon: <XCircle className="w-4 h-4" />,
      label: 'Failed'
    }
  }

  const currentStatus = statusConfig[job.status] || statusConfig.SUBMITTED

  const s3Paths = [
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
  ]

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedPath(value)
    setTimeout(() => setCopiedPath(null), 2000)
  }

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
        
        {/* <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Live Updates</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">Offline</span>
            </div>
          )}
        </div> */}
      </div>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">{job.job_name}</h1>
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

      {/* Progress Bar Section - Hidden for failed and succeeded jobs */}
      {job.status !== 'FAILED' && job.status !== 'SUCCEEDED' && (
        <Card variant="elevated" className="bg-slate-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${currentStatus.bgColor} ${currentStatus.textColor} ${currentStatus.borderColor}`}>
                  {currentStatus.icon}
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
              {['SUBMITTED', 'PENDING', 'RUNNABLE', 'STARTING', 'RUNNING', 'SUCCEEDED'].map((status) => {
                const stepConfig = statusConfig[status]
                const isActive = statusConfig[job.status].progress >= stepConfig.progress
                const isCurrent = job.status === status
                
                return (
                  <div key={status} className="flex flex-col items-center gap-1">
                    <div className={`w-2 h-2 rounded-full transition-colors ${
                      isActive ? stepConfig.color : 'bg-slate-300'
                    } ${isCurrent ? 'ring-2 ring-offset-2 ring-current' : ''}`}></div>
                    <span className={`text-[10px] font-medium ${
                      isActive ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {stepConfig.label}
                    </span>
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
                  {currentStatus.icon}
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
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  job.job_type === 'SINGLE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {job.job_type}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">File Count</label>
              <p className="text-slate-900 font-medium mt-1">{job.file_count}</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Created At</label>
              <p className="text-slate-900 mt-1">
                {new Date(job.created_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Updated At</label>
              <p className="text-slate-900 mt-1">
                {new Date(job.updated_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
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
                    onClick={() => handleCopy(path.value)}
                    className="px-3 py-2 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors whitespace-nowrap flex items-center gap-1"
                  >
                    {copiedPath === path.value ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
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
