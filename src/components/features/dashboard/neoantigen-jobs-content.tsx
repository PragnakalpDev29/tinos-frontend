'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainTableLayout, Column } from '@/components/ui/data-table'
import { Card, CardContent } from '@/components/ui/card'
import { useJobStatusWebSocket } from '@/hooks/use-job-status-websocket'
import { jobService } from '@/lib/services/job.service'
import { Filter, RefreshCcw, FlaskConical } from 'lucide-react'

interface NeoantigenJobRow {
    id: number
    job_id: string
    run_name?: string
    display_name: string
    cores?: number
    display_type: string
    status: string
    created_at: string
    updated_at: string
}

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'All Status' },
    { value: 'PENDING_PREPROCESSING', label: 'Pending (Prep)' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'RUNNABLE', label: 'Runnable' },
    { value: 'STARTING', label: 'Starting' },
    { value: 'RUNNING', label: 'Running' },
    { value: 'SUCCEEDED', label: 'Succeeded' },
    { value: 'FAILED', label: 'Failed' },
]

const STATUS_COLORS: Record<string, string> = {
    SUBMITTED: 'bg-blue-100 text-blue-700',
    PENDING: 'bg-slate-100 text-slate-700',
    PENDING_PREPROCESSING: 'bg-amber-100 text-amber-700 italic',
    RUNNABLE: 'bg-cyan-100 text-cyan-700',
    STARTING: 'bg-indigo-100 text-indigo-700',
    RUNNING: 'bg-amber-100 text-amber-700',
    SUCCEEDED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
}

export function NeoantigenJobsContent() {
    const router = useRouter()
    const [jobs, setJobs] = useState<NeoantigenJobRow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [sortKey, setSortKey] = useState('')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    const fetchJobs = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await jobService.getNeoantigenJobs()
            setJobs(data.map((j: any) => ({
                ...j,
                display_name: j.run_name || 'Unnamed Job',
                display_type: j.cores ? `${j.cores} Cores` : 'Pipeline',
            })))
        } catch (err) {
            console.error('Failed to fetch neoantigen jobs:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => { fetchJobs() }, [fetchJobs])

    const handleStatusUpdate = useCallback((update: { job_id: string; status: string; updated_at: string }) => {
        setJobs(prev => prev.map(j =>
            j.job_id === update.job_id ? { ...j, status: update.status, updated_at: update.updated_at } : j
        ))
    }, [])
    useJobStatusWebSocket({ onStatusUpdate: handleStatusUpdate, autoConnect: true })

    const columns: Column<NeoantigenJobRow>[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
            render: (item) => (
                <Link
                    href={`/dashboard/jobs/${item.id}?type=neoantigen`}
                    className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
                >
                    #{item.id}
                </Link>
            ),
        },
        {
            key: 'run_name',
            header: 'Run Name',
            sortable: true,
            render: (item) => (
                <Link href={`/dashboard/jobs/${item.id}?type=neoantigen`} className="hover:opacity-80 transition-opacity block">
                    <div className="max-w-xs">
                        <span className="font-medium truncate block text-slate-900">{item.display_name}</span>
                        <span className="text-xs text-slate-500 truncate block font-mono">{item.job_id}</span>
                    </div>
                </Link>
            ),
        },
        {
            key: 'cores',
            header: 'Cores',
            sortable: true,
            render: (item) => (
                <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                    {item.cores ? `${item.cores} cores` : '—'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (item) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-700'}`}>
                    {item.status.replace(/_/g, ' ')}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Created',
            sortable: true,
            render: (item) => (
                <span className="text-sm text-slate-600">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                    })}
                </span>
            ),
        },
        {
            key: 'updated_at',
            header: 'Updated',
            sortable: true,
            render: (item) => (
                <span className="text-sm text-slate-600">
                    {new Date(item.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                    })}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item) => (
                <Link
                    href={`/dashboard/jobs/${item.id}?type=neoantigen`}
                    className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-teal-50 hover:text-teal-700 transition-colors text-xs font-semibold"
                >
                    View
                </Link>
            ),
        },
    ]

    const filtered = jobs.filter(j => {
        const matchesSearch = !searchQuery || (
            j.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.job_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.status.toLowerCase().includes(searchQuery.toLowerCase())
        )
        const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalPages = Math.ceil(filtered.length / pageSize)
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortKey(key); setSortDirection('asc') }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <FlaskConical className="w-8 h-8 text-purple-600" />
                        <h1 className="text-3xl font-bold text-slate-900">Neoantigen Jobs</h1>
                    </div>
                    <p className="text-slate-500 text-sm mt-2">
                        Stage 2 — Neoantigen Discovery Pipeline jobs. Auto-triggered after preprocessing succeeds.
                    </p>
                </div>
            </div>

            <Card variant="elevated" className="shadow-lg">
                <CardContent className="p-6">
                    <MainTableLayout
                        title="Neoantigen Jobs"
                        columns={columns}
                        data={paginated}
                        isLoading={isLoading}
                        searchPlaceholder="Search by run name, job ID, or status..."
                        onSearch={(q) => { setSearchQuery(q); setCurrentPage(1) }}
                        filters={
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                                    className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm"
                                >
                                    {STATUS_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                        }
                        actionButtons={
                            <button
                                onClick={fetchJobs}
                                className="p-2 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
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
                        onRowClick={(job) => router.push(`/dashboard/jobs/${job.id}?type=neoantigen`)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
