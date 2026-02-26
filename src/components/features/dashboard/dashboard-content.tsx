'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainTableLayout, Column } from '@/components/ui/data-table'
import { Card, CardContent } from '@/components/ui/card'
import { useJobStatusWebSocket } from '@/hooks/use-job-status-websocket'
import type { User } from '@/types/auth'
import { Plus, Filter, RefreshCcw } from 'lucide-react'
import { jobService } from '@/lib/services/job.service'

interface DashboardContentProps {
  user: User | null
  isLoading: boolean
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

export function DashboardContent({ user, isLoading }: DashboardContentProps) {
  console.log('Dashboard Content - User Data:', user)
  console.log('Dashboard Content - isLoading:', isLoading)
  
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState<'preprocessing' | 'neoantigen'>('preprocessing')

  // State for jobs and loading
  const [jobsData, setJobsData] = useState<JobData[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  const fetchJobs = useCallback(async () => {
    try {
      setIsDataLoading(true)
      const data = activeTab === 'preprocessing'
        ? await jobService.getPreprocessingJobs()
        : await jobService.getNeoantigenJobs()

      // Ensure data is an array before mapping
      if (!Array.isArray(data)) {
        console.error(`Expected array but got:`, data)
        setJobsData([])
        return
      }

      // Normalize data for the table
      const normalizedData = data.map(job => ({
        ...job,
        display_name: job.job_name || job.run_name || 'Unnamed Job',
        display_type: job.job_type || (job.cores ? `${job.cores} Cores` : 'Pipeline')
      }))

      setJobsData(normalizedData)
    } catch (error) {
      console.error(`Failed to fetch ${activeTab} jobs:`, error)
      setJobsData([])
    } finally {
      setIsDataLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchJobs()
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
  const { isConnected, connectionError } = useJobStatusWebSocket({
    onStatusUpdate: handleStatusUpdate,
    autoConnect: true,
  })

  const columns: Column<JobData>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (item) => (
        <Link
          href={`/dashboard/jobs/${item.id}?type=${activeTab}`}
          className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
        >
          #{item.id}
        </Link>
      ),
    },
    {
      key: 'job_name',
      header: 'Job Name',
      sortable: true,
      render: (item) => {
        const href = `/dashboard/jobs/${item.id}?type=${activeTab}`
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
      key: 'file_count',
      header: 'Files',
      sortable: true,
      render: (item) => (
        <span className="font-medium">{item.file_count}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => {
        const statusColors: Record<string, string> = {
          SUBMITTED: 'bg-blue-100 text-blue-700',
          PENDING: 'bg-slate-100 text-slate-700',
          PENDING_PREPROCESSING: 'bg-slate-100 text-slate-700 italic border border-slate-200',
          RUNNABLE: 'bg-cyan-100 text-cyan-700',
          STARTING: 'bg-indigo-100 text-indigo-700',
          RUNNING: 'bg-amber-100 text-amber-700',
          SUCCEEDED: 'bg-green-100 text-green-700',
          FAILED: 'bg-red-100 text-red-700',
        }
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.status] || 'bg-gray-100 text-gray-700'}`}>
            {item.status.replace(/_/g, ' ')}
          </span>
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
      key: 'updated_at',
      header: 'Updated At',
      sortable: true,
      render: (item) => (
        <span className="text-sm">{new Date(item.updated_at).toLocaleDateString('en-US', {
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
      render: (item) => (
        <Link
          href={`/dashboard/jobs/${item.id}?type=${activeTab}`}
          className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-teal-50 hover:text-teal-700 transition-colors text-xs font-semibold"
        >
          View
        </Link>
      ),
    },
  ]

  const filteredData = jobsData.filter((item) => {
    const matchesSearch = !searchQuery || (
      item.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.job_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter

    return matchesSearch && matchesStatus
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

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setActiveTab('preprocessing')}
              className={`pb-2 px-1 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'preprocessing'
                ? 'text-teal-600 border-teal-600'
                : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
            >
              Preprocessing Jobs
            </button>
            <button
              onClick={() => setActiveTab('neoantigen')}
              className={`pb-2 px-1 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'neoantigen'
                ? 'text-teal-600 border-teal-600'
                : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
            >
              Neoantigen Jobs
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-2 italic">
            Note: Successful Preprocessing jobs automatically trigger a corresponding Neoantigen job.
          </p>
        </div>
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
          {connectionError && (
            <div className="text-xs text-red-600 max-w-xs">
              {connectionError}
            </div>
          )}
        </div> */}
      </div>

      <Card variant="elevated" className="shadow-lg">
        <CardContent className="p-6">
          <MainTableLayout
            title={activeTab === 'preprocessing' ? "Preprocessing Jobs" : "Neoantigen Jobs"}
            columns={activeTab === 'preprocessing' ? columns : columns.filter(c => c.key !== 'file_count')}
            data={paginatedData}
            isLoading={isLoading || isDataLoading}
            searchPlaceholder="Search by job name, job ID, type, or status..."
            onSearch={setSearchQuery}
            filters={
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
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
                  onClick={fetchJobs}
                  className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Refresh data"
                >
                  <RefreshCcw className={`w-4 h-4 ${isDataLoading ? 'animate-spin' : ''}`} />
                </button>
                <Link href={activeTab === 'preprocessing' ? "/preprocessing" : "/neoantigen"}>
                  <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {activeTab === 'preprocessing' ? 'Start New Pipeline' : 'New Neoantigen Job'}
                    </span>
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
            onRowClick={(job) => router.push(`/dashboard/jobs/${job.id}?type=${activeTab}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
