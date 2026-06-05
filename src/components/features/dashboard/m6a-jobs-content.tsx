'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
 Plus,
 RefreshCcw,
 LayoutDashboard,
 Activity,
 CheckCircle2,
 AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent } from '@/components/ui/card'
import { MainTableLayout, Column } from '@/components/ui/data-table'
import { useJobStatusWebSocket } from '@/hooks/use-job-status-websocket'
import { jobService, type M6aJobData } from '@/lib/services/job.service'

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

function statusPillClass(status?: string): string {
 const s = (status || 'UNKNOWN').toUpperCase()
 const map: Record<string, string> = {
 SUBMITTED: 'bg-blue-100 text-blue-700',
 PENDING: 'bg-white text-[#08333D] border border-[#90BCC5]/50',
 RUNNABLE: 'bg-cyan-100 text-cyan-700',
 STARTING: 'bg-indigo-100 text-indigo-700',
 RUNNING: 'bg-amber-100 text-amber-700 animate-pulse',
 SUCCEEDED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
 FAILED: 'bg-red-100 text-red-700 border border-red-200',
 TERMINATED: 'bg-gray-200 text-[#08333D]',
 }
 return map[s] || 'bg-gray-100 text-[#08333D]'
}

export function M6aJobsContent() {
 const router = useRouter()
 const [jobs, setJobs] = useState<M6aJobData[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [searchQuery, setSearchQuery] = useState('')
 const [statusFilter, setStatusFilter] = useState<string>('ALL')
 const [currentPage, setCurrentPage] = useState(1)
 const [pageSize, setPageSize] = useState(10)
 const [sortKey, setSortKey] = useState<string>('created_at')
 const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

 const fetchJobs = useCallback(async (options?: { silent?: boolean }) => {
 const silent = options?.silent === true
 try {
 if (!silent) setIsLoading(true)
 const data = await jobService.getM6aJobs()
 setJobs(data || [])
 } catch (err) {
 const status = (err as any)?.response?.status
 if (status === 401 || status === 403) {
 try {
 const { signOut } = await import('next-auth/react')
 await signOut({ callbackUrl: '/login' })
 } catch {
 router.replace('/login')
 }
 return
 }
 console.error('Failed to load m6A jobs:', err)
 if (!silent) toast.error('Failed to load m6A jobs')
 } finally {
 if (!silent) setIsLoading(false)
 }
 }, [router])

 useEffect(() => {
 fetchJobs()
 }, [fetchJobs])

 // Poll list as fallback when websocket is unavailable.
 useEffect(() => {
 const poll = setInterval(() => {
 fetchJobs({ silent: true })
 }, 15_000)
 return () => clearInterval(poll)
 }, [fetchJobs])

 const handleStatusUpdate = useCallback(
 (u: { job_id: string; status: string; updated_at: string }) => {
 setJobs((prev) =>
 prev.map((j) =>
 j.job_id === u.job_id ? { ...j, status: u.status, updated_at: u.updated_at } : j,
 ),
 )
 },
 [],
 )
 const { isConnected } = useJobStatusWebSocket({
 onStatusUpdate: handleStatusUpdate,
 autoConnect: true,
 })

 const stats = useMemo(() => {
 const active = jobs.filter((j) =>
 ['RUNNING', 'STARTING', 'RUNNABLE', 'PENDING', 'SUBMITTED'].includes(
 (j.status || '').toUpperCase(),
 ),
 ).length
 return {
 total: jobs.length,
 active,
 success: jobs.filter((j) => (j.status || '').toUpperCase() === 'SUCCEEDED').length,
 failed: jobs.filter((j) => (j.status || '').toUpperCase() === 'FAILED').length,
 }
 }, [jobs])

 const filtered = useMemo(() => {
 const q = searchQuery.trim().toLowerCase()
 return jobs.filter((j) => {
 const matchesSearch =
 !q ||
 j.job_name?.toLowerCase().includes(q) ||
 j.job_id?.toLowerCase().includes(q) ||
 j.run_folder?.toLowerCase().includes(q) ||
 j.s3_output?.toLowerCase().includes(q)
 const matchesStatus =
 statusFilter === 'ALL' || (j.status || '').toUpperCase() === statusFilter
 return matchesSearch && matchesStatus
 })
 }, [jobs, searchQuery, statusFilter])

 const sorted = useMemo(() => {
 const copy = [...filtered]
 copy.sort((a, b) => {
 const av = (a as any)[sortKey]
 const bv = (b as any)[sortKey]
 if (av == null && bv == null) return 0
 if (av == null) return 1
 if (bv == null) return -1
 if (av < bv) return sortDirection === 'asc' ? -1 : 1
 if (av > bv) return sortDirection === 'asc' ? 1 : -1
 return 0
 })
 return copy
 }, [filtered, sortKey, sortDirection])

 const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
 const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

 const handleSort = (key: string) => {
 if (sortKey === key) {
 setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
 } else {
 setSortKey(key)
 setSortDirection('asc')
 }
 }

 const columns: Column<M6aJobData>[] = [
 {
 key: 'id',
 header: 'ID',
 sortable: true,
 render: (item) => (
 <Link
 href={`/dashboard/jobs/${item.id}?type=m6a`}
 className="font-medium text-[#08333D] hover:text-[#08333D] hover:underline"
 >
 #{item.id}
 </Link>
 ),
 },
 {
 key: 'job_name',
 header: 'Job Name',
 sortable: true,
 render: (item) => (
 <Link href={`/dashboard/jobs/${item.id}?type=m6a`} className="block hover:opacity-80">
 <div className="max-w-xs">
 <span className="font-medium truncate block text-[#08333D]">
 {item.job_name || item.run_folder}
 </span>
 <span className="text-xs text-[#08333D] truncate block font-mono">{item.job_id}</span>
 </div>
 </Link>
 ),
 },
 {
 key: 'status',
 header: 'Status',
 sortable: true,
 render: (item) => (
 <div className="flex flex-col gap-1">
 <span
 className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${statusPillClass(
 item.status,
 )}`}
 >
 {(item.status || 'UNKNOWN').toUpperCase()}
 </span>
 {item.failure_reason && (item.status || '').toUpperCase() === 'FAILED' && (
 <p
 className="text-[10px] text-red-500 font-medium max-w-[220px] truncate"
 title={item.failure_reason}
 >
 Reason: {item.failure_reason}
 </p>
 )}
 </div>
 ),
 },
 {
 key: 'baseline_file_count',
 header: 'Files',
 render: (item) => (
 <span className="text-xs text-[#08333D]">
 {item.baseline_file_count ?? 0} / {item.intervention_file_count ?? 0}
 </span>
 ),
 },
 {
 key: 'created_at',
 header: 'Created',
 sortable: true,
 render: (item) => (
 <span className="text-sm">
 {new Date(item.created_at).toLocaleString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 })}
 </span>
 ),
 },
 {
 key: 'actions',
 header: 'Actions',
 render: (item) => {
 const isSubmitted = (item.status || '').toUpperCase() === 'SUBMITTED'
 return isSubmitted ? (
 <span className="inline-flex items-center px-3 py-1 bg-white/40 text-[#08333D]/80 rounded text-xs font-semibold cursor-not-allowed">
 View
 </span>
 ) : (
 <Link
 href={`/dashboard/jobs/${item.id}?type=m6a`}
 className="inline-flex items-center px-3 py-1 bg-white text-[#08333D] rounded hover:bg-white/50 hover:text-[#08333D] transition-colors text-xs font-semibold"
 >
 View
 </Link>
 )
 },
 },
 ]

 return (
 <div className="space-y-8">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-3">
 <h1 className="text-3xl font-bold text-[#08333D]">m6A Jobs</h1>
 <div
 className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
 isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-white/50 text-[#08333D]'
 }`}
 >
 <div
 className={`w-1.5 h-1.5 rounded-full ${
 isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 '
 }`}
 />
 {isConnected ? 'Live' : 'Offline'}
 </div>
 </div>
 <p className="text-[#08333D] text-sm mt-2">
 m6A / MeRIP-seq differential peak analysis runs. Click a row to open the job details.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="rounded-xl border border-[#90BCC5]/50 shadow-sm overflow-hidden bg-white/75 backdrop-blur-md p-4 flex items-center gap-4">
 <div className="p-3 bg-[#466F78]/20 text-[#08333D] rounded-xl">
 <LayoutDashboard className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-semibold text-[#08333D] uppercase tracking-wider">Total Jobs</p>
 <h3 className="text-2xl font-bold text-[#08333D]">{stats.total}</h3>
 </div>
 </div>
 <div className="rounded-xl border border-[#90BCC5]/50 shadow-sm overflow-hidden bg-white/75 backdrop-blur-md p-4 flex items-center gap-4">
 <div className="p-3 bg-amber-100/80 text-amber-600 rounded-xl">
 <Activity className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-semibold text-[#08333D] uppercase tracking-wider">Active</p>
 <h3 className="text-2xl font-bold text-[#08333D]">{stats.active}</h3>
 </div>
 </div>
 <div className="rounded-xl border border-[#90BCC5]/50 shadow-sm overflow-hidden bg-white/75 backdrop-blur-md p-4 flex items-center gap-4">
 <div className="p-3 bg-emerald-100/80 text-emerald-600 rounded-xl">
 <CheckCircle2 className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-semibold text-[#08333D] uppercase tracking-wider">Succeeded</p>
 <h3 className="text-2xl font-bold text-[#08333D]">{stats.success}</h3>
 </div>
 </div>
 <div className="rounded-xl border border-[#90BCC5]/50 shadow-sm overflow-hidden bg-white/75 backdrop-blur-md p-4 flex items-center gap-4">
 <div className="p-3 bg-red-100/80 text-red-500 rounded-xl">
 <AlertCircle className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-semibold text-[#08333D] uppercase tracking-wider">Failed</p>
 <h3 className="text-2xl font-bold text-[#08333D]">{stats.failed}</h3>
 </div>
 </div>
 </div>

 <Card variant="elevated" className="shadow-lg">
 <CardContent className="p-6">
 <MainTableLayout
 title="All m6A Jobs"
 columns={columns}
 data={paginated}
 isLoading={isLoading}
 searchPlaceholder="Search by job name, run folder, job ID, or S3 path..."
 onSearch={(v) => {
 setSearchQuery(v)
 setCurrentPage(1)
 }}
 filters={
 <div className="flex flex-wrap items-center gap-3">
 <select
 value={statusFilter}
 onChange={(e) => {
 setStatusFilter(e.target.value)
 setCurrentPage(1)
 }}
 className="px-4 py-2 border border-[#90BCC5]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm"
 >
 {JOB_STATUS_OPTIONS.map((o) => (
 <option key={o.value} value={o.value}>
 {o.label}
 </option>
 ))}
 </select>
 </div>
 }
 actionButtons={
 <div className="flex items-center gap-2">
 <button
 onClick={() => fetchJobs()}
 className="p-2 text-[#08333D] hover:text-[#08333D] hover:bg-[#08333D] rounded-lg transition-colors"
 title="Refresh data"
 >
 <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
 </button>
 <Link href="/m6a-analysis">
 <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
 <Plus className="w-4 h-4" />
 <span className="hidden sm:inline">New m6A Run</span>
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
 onRowClick={(job) => router.push(`/dashboard/jobs/${job.id}?type=m6a`)}
 />
 </CardContent>
 </Card>
 </div>
 )
}
