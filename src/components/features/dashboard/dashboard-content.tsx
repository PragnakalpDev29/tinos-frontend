'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainTableLayout, Column } from '@/components/ui/data-table'
import { Card, CardContent } from '@/components/ui/card'
import { useJobStatusWebSocket } from '@/hooks/use-job-status-websocket'
import type { User } from '@/types/auth'
import { Plus, Filter, Wifi, WifiOff } from 'lucide-react'
import mockJobsData from '@/data/mock-jobs.json'

interface DashboardContentProps {
  user: User | null
  isLoading: boolean
}

interface JobData {
  id: number
  job_id: string
  job_name: string
  job_type: 'SINGLE' | 'ARRAY'
  s3_rna_bam: string
  s3_deg_bam: string
  s3_deg_jr: string
  s3_gtex: string
  s3_gencode: string
  s3_output_bucket: string
  s3_hla_output: string
  s3_rna_bam_output: string
  s3_logs_bucket: string
  file_count: number
  status: 'SUBMITTED' | 'PENDING' | 'RUNNABLE' | 'STARTING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  created_at: string
  updated_at: string
  s3_deg_bam_consolidated: string | null
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
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Initialize jobs data with state for real-time updates
  const [jobsData, setJobsData] = useState<JobData[]>(mockJobsData as JobData[])

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
        <span className="font-medium text-teal-600">#{item.id}</span>
      ),
    },
    {
      key: 'job_name',
      header: 'Job Name',
      sortable: true,
      render: (item) => (
        <div className="max-w-xs">
          <span className="font-medium truncate block">{item.job_name}</span>
          <span className="text-xs text-slate-500 truncate block">{item.job_id}</span>
        </div>
      ),
    },
    {
      key: 'job_type',
      header: 'Type',
      sortable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          item.job_type === 'SINGLE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {item.job_type}
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
          RUNNABLE: 'bg-cyan-100 text-cyan-700',
          STARTING: 'bg-indigo-100 text-indigo-700',
          RUNNING: 'bg-amber-100 text-amber-700',
          SUCCEEDED: 'bg-green-100 text-green-700',
          FAILED: 'bg-red-100 text-red-700',
        }
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.status] || 'bg-gray-100 text-gray-700'}`}>
            {item.status}
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
  ]

  const filteredData = jobsData.filter((item) => {
    const matchesSearch = !searchQuery || (
      item.job_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.job_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.job_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          <p className="text-slate-600 mt-2">
            {isLoading ? 'Loading your jobs...' : "Here's your preprocessing jobs overview."}
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
            title="Preprocessing Jobs"
            columns={columns}
            data={paginatedData}
            isLoading={isLoading}
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
              <Link href="/preprocessing">
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Job</span>
                </button>
              </Link>
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
            onRowClick={(job) => router.push(`/dashboard/jobs/${job.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
