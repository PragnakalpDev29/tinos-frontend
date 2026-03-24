'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainTableLayout, Column } from '@/components/ui/data-table'
import { Card, CardContent } from '@/components/ui/card'
import { useJobStatusWebSocket } from '@/hooks/use-job-status-websocket'
import type { User } from '@/types/auth'
import { Plus, Filter, RefreshCcw, LayoutDashboard, Activity, CheckCircle2, AlertCircle } from 'lucide-react'
import { jobService, ArcasHlaJobData } from '@/lib/services/job.service'

interface DashboardContentProps {
  user: User | null
  isLoading: boolean
  pipelineType?: 'Preprocessing' | 'Neoantigen'
}

interface JobData {
  id: number
  job_id: string
  job_name?: string
  run_name?: string
  display_name: string
  job_type?: 'SINGLE' | 'ARRAY'
  display_type: string
  status: string
  created_at: string
  updated_at: string
  file_count?: number
  cores?: number
  is_child?: boolean
  child_index?: number
  pipeline_type?: string
  linked_neoantigen_status?: string
  linked_neoantigen_id?: number
  failure_reason?: string
  linked_neoantigen_failure_reason?: string
  linked_arcas_hla?: ArcasHlaJobData | null
}

const JOB_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RUNNABLE', label: 'Runnable' },
  { value: 'STARTING', label: 'Starting' },
  { value: 'RUNNING', label: 'Running' },
  { value: 'SUCCEEDED', label: 'Succeeded' },
  { value: 'FAILED', label: 'Failed' },
]

export function DashboardContent({ user, isLoading, pipelineType }: DashboardContentProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [pipelineFilter, setPipelineFilter] = useState<string>(pipelineType || 'ALL')

  // State for jobs and loading
  const [jobsData, setJobsData] = useState<JobData[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  const fetchJobs = useCallback(async () => {
    try {
      setIsDataLoading(true)
      const fetchPreprocessing = jobService.getPreprocessingJobs()
      const fetchNeoantigen = pipelineType === 'Preprocessing'
        ? Promise.resolve([])
        : jobService.getNeoantigenJobs()

      const [preprocessingData, neoantigenData] = await Promise.all([
        fetchPreprocessing,
        fetchNeoantigen,
      ])

      const normalizedPre = preprocessingData.map(job => ({
        ...job,
        display_name: job.job_name || 'Unnamed Job',
        display_type: job.job_type || 'Preprocessing',
        pipeline_type: 'Preprocessing',
      }))

      const normalizedNeo = neoantigenData.map(job => ({
        ...job,
        display_name: job.run_name || 'Unnamed Job',
        display_type: job.cores ? `${job.cores} Cores` : 'Neoantigen',
        pipeline_type: 'Neoantigen',
      }))

      // Filter out Neoantigen jobs that are already linked to a Preprocessing job
      // to treat the pipeline as a "single element".
      const linkedNeoIds = new Set(normalizedPre.map(p => p.linked_neoantigen_id).filter(id => !!id))
      const standaloneNeo = normalizedNeo.filter(n => !linkedNeoIds.has(n.id))

      let allJobs = [...normalizedPre, ...standaloneNeo]

      // If a specific pipeline type is requested via props, filter it here
      if (pipelineType) {
        allJobs = allJobs.filter(j => j.pipeline_type === pipelineType)
      }

      setJobsData(allJobs)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setIsDataLoading(false)
    }
  }, [pipelineType])

  const syncAndRefresh = useCallback(async () => {
    try {
      setIsDataLoading(true)
      await jobService.syncActiveJobs()
      await fetchJobs()
    } catch (err) {
      console.error('Sync failed:', err)
      await fetchJobs()
    }
  }, [fetchJobs])

  useEffect(() => {
    // Force a sync with AWS on mount to ensure fresh status data
    jobService.syncActiveJobs().then(() => fetchJobs()).catch(() => fetchJobs())
  }, [fetchJobs])

  // Handle real-time job status updates via WebSocket
  const handleStatusUpdate = useCallback((update: { job_id: string; status: JobData['status']; updated_at: string }) => {
    setJobsData(prevJobs =>
      prevJobs.map(job =>
        job.job_id === update.job_id
          ? { ...job, status: update.status, updated_at: update.updated_at }
          : job
      )
    )
  }, [])

  // Connect to WebSocket for real-time status updates
  const { isConnected } = useJobStatusWebSocket({
    onStatusUpdate: handleStatusUpdate,
    autoConnect: true,
  })

  // Calculate stats
  const stats = {
    total: jobsData.length,
    preprocessing: jobsData.filter(j => j.pipeline_type === 'Preprocessing').length,
    neoantigen: jobsData.filter(j => j.pipeline_type === 'Neoantigen').length,
    success: jobsData.filter(j =>
      j.status === 'SUCCEEDED' &&
      (j.pipeline_type !== 'Preprocessing' || !j.linked_neoantigen_status || j.linked_neoantigen_status === 'SUCCEEDED')
    ).length,
    failed: jobsData.filter(j =>
      j.status === 'FAILED' ||
      (j.pipeline_type === 'Preprocessing' && j.linked_neoantigen_status === 'FAILED')
    ).length,
    active: jobsData.filter(j =>
      ['RUNNING', 'STARTING', 'RUNNABLE', 'PENDING', 'SUBMITTED'].includes(j.status) ||
      (j.pipeline_type === 'Preprocessing' && j.linked_neoantigen_status && ['RUNNING', 'STARTING', 'RUNNABLE', 'PENDING', 'SUBMITTED'].includes(j.linked_neoantigen_status))
    ).length
  }

  const columns: Column<JobData>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (item) => (
        <Link
          href={`/dashboard/jobs/${item.id}?type=${item.pipeline_type === 'Neoantigen' ? 'neoantigen' : 'preprocessing'}`}
          className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
        >
          #{item.id}
        </Link>
      ),
    },
    {
      key: 'pipeline_type',
      header: 'Pipeline',
      sortable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${(item as any).pipeline_type === 'Neoantigen'
          ? 'bg-violet-100 text-violet-700'
          : 'bg-teal-100 text-teal-700'
          }`}>
          {(item as any).pipeline_type || 'Preprocessing'}
        </span>
      ),
    },
    {
      key: 'job_name',
      header: 'Job Name',
      sortable: true,
      render: (item) => {
        const type = (item as any).pipeline_type === 'Neoantigen' ? 'neoantigen' : 'preprocessing'
        const href = `/dashboard/jobs/${item.id}?type=${type}`
        return (
          <Link href={href} className="hover:opacity-80 transition-opacity block">
            <div className="max-w-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate block text-slate-900">
                  {item.is_child
                    ? (item.job_name || item.display_name).replace(/ \[Child \d+\]$/, '')
                    : item.display_name}
                </span>
                {item.is_child && (
                  <span className="shrink-0 text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                    Child {item.child_index}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 truncate block font-mono">{item.job_id}</span>
            </div>
          </Link>
        )
      },
    },
    {
      key: 'job_type',
      header: 'Type',
      sortable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${item.job_type === 'SINGLE' ? 'bg-blue-100 text-blue-700' :
          item.job_type === 'ARRAY' ? 'bg-purple-100 text-purple-700' :
            'bg-slate-100 text-slate-700'
          }`}>
          {item.display_type}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Pipeline Status',
      sortable: true,
      render: (item) => {
        const statusColors: Record<string, string> = {
          SUBMITTED: 'bg-blue-100 text-blue-700',
          PENDING: 'bg-slate-100 text-slate-700 border border-slate-200',
          PENDING_PREPROCESSING: 'bg-slate-100 text-slate-700 italic border border-slate-200',
          RUNNABLE: 'bg-cyan-100 text-cyan-700',
          STARTING: 'bg-indigo-100 text-indigo-700',
          RUNNING: 'bg-amber-100 text-amber-700 animate-pulse',
          SUCCEEDED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
          FAILED: 'bg-red-100 text-red-700 border border-red-200',
          TERMINATED: 'bg-gray-200 text-gray-800',
        }

        const renderBatchStatus = (status: string, label: string) => {
          const normalizedStatus = (status || 'UNKNOWN').toUpperCase()
          const colorClass = statusColors[normalizedStatus] || 'bg-gray-100 text-gray-600'

          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter leading-none">{label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${colorClass}`}>
                {normalizedStatus.replace(/_/g, ' ')}
              </span>
            </div>
          )
        }

        if (item.pipeline_type === 'Preprocessing') {
          return (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {renderBatchStatus(item.status, 'Stage 1: Prep')}
                {item.linked_arcas_hla && (
                  <>
                    <div className="h-4 w-px bg-slate-200 self-end mb-1 mx-1" />
                    {renderBatchStatus(item.linked_arcas_hla.status, 'HLA')}
                  </>
                )}
                {item.linked_neoantigen_status && (
                  <>
                    <div className="h-4 w-px bg-slate-200 self-end mb-1 mx-1" />
                    {renderBatchStatus(item.linked_neoantigen_status, 'Stage 2: Neo')}
                  </>
                )}
              </div>
              {/* Show Stage 1 failure reason */}
              {item.status === 'FAILED' && item.failure_reason && (
                <p className="text-[10px] text-red-500 font-medium max-w-[200px] truncate" title={`Stage 1 Error: ${item.failure_reason}`}>
                  S1 Error: {item.failure_reason}
                </p>
              )}
              {/* Show HLA failure reason */}
              {item.linked_arcas_hla?.status === 'FAILED' && item.linked_arcas_hla.failure_reason && (
                <p className="text-[10px] text-orange-600 font-medium max-w-[200px] truncate" title={`HLA Error: ${item.linked_arcas_hla.failure_reason}`}>
                  HLA Error: {item.linked_arcas_hla.failure_reason}
                </p>
              )}
              {/* Show Stage 2 failure reason */}
              {item.linked_neoantigen_status === 'FAILED' && item.linked_neoantigen_failure_reason && (
                <p className="text-[10px] text-red-600 font-medium max-w-[200px] truncate" title={`Stage 2 Error: ${item.linked_neoantigen_failure_reason}`}>
                  S2 Error: {item.linked_neoantigen_failure_reason}
                </p>
              )}
            </div>
          )
        }

        return (
          <div className="flex flex-col gap-1">
            {renderBatchStatus(item.status, 'Neoantigen')}
            {item.status === 'FAILED' && item.failure_reason && (
              <p className="text-[10px] text-red-500 font-medium max-w-[200px] truncate" title={item.failure_reason}>
                Reason: {item.failure_reason}
              </p>
            )}
          </div>
        )
      },
    },
    {
      key: 'created_at',
      header: 'Created At',
      sortable: true,
      render: (item) => (
        <span className="text-sm">{new Date(item.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        const type = (item as any).pipeline_type === 'Neoantigen' ? 'neoantigen' : 'preprocessing'
        return (
          <Link
            href={`/dashboard/jobs/${item.id}?type=${type}`}
            className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-teal-50 hover:text-teal-700 transition-colors text-xs font-semibold"
          >
            View
          </Link>
        )
      },
    },
  ]

  const filteredData = jobsData.filter((item) => {
    const matchesSearch = !searchQuery || (
      item.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.job_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const matchesStatus = statusFilter === 'ALL' ||
      item.status === statusFilter ||
      (item.pipeline_type === 'Preprocessing' && item.linked_neoantigen_status === statusFilter)
    const matchesPipeline = pipelineFilter === 'ALL' || item.pipeline_type === pipelineFilter

    return matchesSearch && matchesStatus && matchesPipeline
  })

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const pageTitle = pipelineType ? `${pipelineType} Jobs` : `Welcome back, ${user?.name || 'User'}!`

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">
              {pageTitle}
            </h1>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isConnected ? 'Live' : 'Offline'}
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-2">
            All preprocessing and neoantigen jobs are shown below. Successful preprocessing jobs automatically trigger a neoantigen job.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Jobs</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Activity className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Run</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.active}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Succeeded</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.success}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/60 shadow-sm overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Failed Jobs</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.failed}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated" className="shadow-lg">
        <CardContent className="p-6">
          <MainTableLayout
            title={pipelineType ? `${pipelineType} Jobs` : "All Pipeline Jobs"}
            columns={columns}
            data={paginatedData}
            isLoading={isLoading || isDataLoading}
            searchPlaceholder="Search by job name, job ID, type, or status..."
            onSearch={setSearchQuery}
            filters={
              <div className="flex flex-wrap items-center gap-3">
                {!pipelineType && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                      value={pipelineFilter}
                      onChange={(e) => {
                        setPipelineFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                    >
                      <option value="ALL">All Pipelines</option>
                      <option value="Preprocessing">Preprocessing</option>
                      <option value="Neoantigen">Neoantigen</option>
                    </select>
                  </div>
                )}

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                >
                  {JOB_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            }
            actionButtons={
              <div className="flex items-center gap-2">
                <button
                  onClick={syncAndRefresh}
                  className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Refresh data"
                >
                  <RefreshCcw className={`w-4 h-4 ${isDataLoading ? 'animate-spin' : ''}`} />
                </button>
                <Link href="/preprocessing">
                  <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Start New Pipeline</span>
                  </button>
                </Link>
              </div>
            }
            pagination={true}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onRowClick={async (job) => {
              // Trigger a background sync for active jobs whenever any row is clicked
              if (['RUNNING', 'SUBMITTED', 'PENDING', 'RUNNABLE', 'STARTING'].includes(job.status)) {
                jobService.syncActiveJobs().then(() => fetchJobs())
              }
              router.push(`/dashboard/jobs/${job.id}?type=${job.pipeline_type === 'Neoantigen' ? 'neoantigen' : 'preprocessing'}`)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
