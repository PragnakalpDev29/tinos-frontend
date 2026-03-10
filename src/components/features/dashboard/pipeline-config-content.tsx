'use client'

import { useEffect, useState, useCallback } from 'react'
import { axiosClient } from '@/lib/api/axios-client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import toast from 'react-hot-toast'
import { Save, RotateCcw, Pencil, Check, X, Database, Cpu, FolderOutput, FolderInput } from 'lucide-react'

interface ConfigRow {
    id: number
    key: string
    stage: 'stage1' | 'stage2'
    category: string
    label: string
    value: string
    updated_at: string
}

const STAGE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
    stage1: { label: 'Stage 1 — Preprocessing', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    stage2: { label: 'Stage 2 — Neoantigen Discovery', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
    'Input Paths': <FolderInput className="w-4 h-4" />,
    'Output Paths': <FolderOutput className="w-4 h-4" />,
    'Compute': <Cpu className="w-4 h-4" />,
}

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
    return arr.reduce((acc, item) => {
        const k = String(item[key])
        acc[k] = acc[k] ? [...acc[k], item] : [item]
        return acc
    }, {} as Record<string, T[]>)
}

export function PipelineConfigContent() {
    const [rows, setRows] = useState<ConfigRow[]>([])
    const [edits, setEdits] = useState<Record<string, string>>({})
    const [editing, setEditing] = useState<Set<string>>(new Set())
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const fetchConfig = useCallback(async () => {
        try {
            setIsLoading(true)
            const res = await axiosClient.get<ConfigRow[]>(API_ENDPOINTS.JOBS.PIPELINE_CONFIG)
            setRows(res.data)
        } catch (e: any) {
            toast.error('Failed to load pipeline configuration.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => { fetchConfig() }, [fetchConfig])

    const startEdit = (key: string, currentValue: string) => {
        setEditing(prev => new Set(prev).add(key))
        setEdits(prev => ({ ...prev, [key]: currentValue }))
    }

    const cancelEdit = (key: string) => {
        setEditing(prev => { const s = new Set(prev); s.delete(key); return s })
    }

    const handleChange = (key: string, value: string) => {
        setEdits(prev => ({ ...prev, [key]: value }))
    }

    const saveSingle = async (key: string) => {
        const value = edits[key]
        if (value === undefined) return
        setIsSaving(true)
        try {
            await axiosClient.patch(API_ENDPOINTS.JOBS.PIPELINE_CONFIG, [{ key, value }])
            setRows(prev => prev.map(r => r.key === key ? { ...r, value } : r))
            cancelEdit(key)
            toast.success(`Saved: ${key}`)
        } catch {
            toast.error('Save failed.')
        } finally {
            setIsSaving(false)
        }
    }

    const saveAll = async () => {
        const payload = Object.entries(edits).map(([key, value]) => ({ key, value }))
        if (!payload.length) { toast('Nothing to save.'); return }
        setIsSaving(true)
        try {
            await axiosClient.patch(API_ENDPOINTS.JOBS.PIPELINE_CONFIG, payload)
            setRows(prev => prev.map(r => edits[r.key] !== undefined ? { ...r, value: edits[r.key] } : r))
            setEditing(new Set())
            setEdits({})
            toast.success(`Saved ${payload.length} value(s)`)
        } catch {
            toast.error('Save failed.')
        } finally {
            setIsSaving(false)
        }
    }

    const resetAll = () => {
        setEditing(new Set())
        setEdits({})
        toast('Unsaved changes discarded.')
    }

    const byStage = groupBy(rows, 'stage')
    const hasChanges = editing.size > 0

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Database className="w-7 h-7 text-teal-600" />
                        Pipeline Configuration
                    </h1>
                    <p className="text-slate-500 mt-1.5 text-sm">
                        Edit the default S3 paths and compute settings used by each stage of the pipeline.
                        Changes are saved to the database and take effect on the <strong>next</strong> job submission.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {hasChanges && (
                        <button
                            onClick={resetAll}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                            <RotateCcw className="w-4 h-4" /> Discard All
                        </button>
                    )}
                    <button
                        onClick={saveAll}
                        disabled={isSaving || !hasChanges}
                        className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-40 transition-colors text-sm font-semibold shadow"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving…' : `Save All${hasChanges ? ` (${editing.size})` : ''}`}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-24 text-slate-400 text-sm">Loading configuration…</div>
            ) : (
                Object.entries(byStage).map(([stage, stageRows]) => {
                    const meta = STAGE_META[stage] || { label: stage, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' }
                    const byCategory = groupBy(stageRows, 'category')

                    return (
                        <div key={stage} className={`rounded-xl border ${meta.border} overflow-hidden shadow-sm`}>
                            <div className={`${meta.bg} px-6 py-4 flex items-center gap-3 border-b ${meta.border}`}>
                                <div className={`text-lg font-bold ${meta.color}`}>{meta.label}</div>
                            </div>

                            {Object.entries(byCategory).map(([category, catRows]) => (
                                <div key={category}>
                                    <div className="bg-white border-b border-slate-100 px-6 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        {CATEGORY_ICON[category] ?? <Database className="w-4 h-4" />}
                                        {category}
                                    </div>

                                    <table className="w-full text-sm bg-white">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                                                <th className="text-left px-6 py-2 font-semibold w-52">Parameter</th>
                                                <th className="text-left px-4 py-2 font-semibold">Value</th>
                                                <th className="text-left px-4 py-2 font-semibold w-40">Last Updated</th>
                                                <th className="px-4 py-2 w-24" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {catRows.map((row, i) => {
                                                const isEdit = editing.has(row.key)
                                                const isDirty = edits[row.key] !== undefined && edits[row.key] !== row.value
                                                return (
                                                    <tr
                                                        key={row.key}
                                                        className={`border-b border-slate-50 transition-colors ${isEdit ? 'bg-amber-50/40' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                                                    >
                                                        <td className="px-6 py-3 align-top">
                                                            <div className="font-semibold text-slate-700">{row.label}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.key}</div>
                                                        </td>

                                                        <td className="px-4 py-3 align-top">
                                                            {isEdit ? (
                                                                <div className="space-y-1">
                                                                    <input
                                                                        autoFocus
                                                                        value={edits[row.key] ?? row.value}
                                                                        onChange={e => handleChange(row.key, e.target.value)}
                                                                        className={`w-full px-3 py-1.5 border-2 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white ${(row.key === 'neo_num_cores' && parseInt(edits[row.key] ?? row.value) > 300) ||
                                                                                (row.key !== 'neo_num_cores' && (edits[row.key] ?? row.value).trim() && !(edits[row.key] ?? row.value).trim().toLowerCase().startsWith('s3://'))
                                                                                ? 'border-red-400 focus:ring-red-500'
                                                                                : 'border-teal-400'
                                                                            }`}
                                                                    />
                                                                    {row.key === 'neo_num_cores' && parseInt(edits[row.key] ?? row.value) > 300 && (
                                                                        <p className="text-[10px] text-red-600 font-bold animate-pulse">
                                                                            ⚠ Maximum limit is 300 cores.
                                                                        </p>
                                                                    )}
                                                                    {row.key !== 'neo_num_cores' && (edits[row.key] ?? row.value).trim() && !(edits[row.key] ?? row.value).trim().toLowerCase().startsWith('s3://') && (
                                                                        <p className="text-[10px] text-red-600 font-bold animate-pulse">
                                                                            ⚠ Invalid S3 link. Must start with s3://
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="font-mono text-xs text-slate-600 break-all">{row.value}</span>
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3 align-top text-xs text-slate-400 whitespace-nowrap">
                                                            {new Date(row.updated_at).toLocaleDateString('en-US', {
                                                                month: 'short', day: 'numeric', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </td>

                                                        <td className="px-4 py-3 align-top">
                                                            <div className="flex items-center gap-1 justify-end">
                                                                {isEdit ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => saveSingle(row.key)}
                                                                            disabled={isSaving}
                                                                            title="Save"
                                                                            className="p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition-colors"
                                                                        >
                                                                            <Check className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => cancelEdit(row.key)}
                                                                            title="Cancel"
                                                                            className="p-1.5 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-100 transition-colors"
                                                                        >
                                                                            <X className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => startEdit(row.key, row.value)}
                                                                        title="Edit"
                                                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                                                    >
                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )
                })
            )}
        </div>
    )
}
