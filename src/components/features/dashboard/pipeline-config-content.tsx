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

    // HLA Config state
    const [hlaRows, setHlaRows] = useState<ConfigRow[]>([])
    const [hlaEdits, setHlaEdits] = useState<Record<string, string>>({})
    const [hlaEditing, setHlaEditing] = useState<Set<string>>(new Set())
    const [isHlaSaving, setIsHlaSaving] = useState(false)
    const [isHlaLoading, setIsHlaLoading] = useState(true)

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

    const fetchHlaConfig = useCallback(async () => {
        try {
            setIsHlaLoading(true)
            const res = await axiosClient.get<ConfigRow[]>(API_ENDPOINTS.JOBS.PIPELINE_CONFIG_HLA)
            setHlaRows(res.data)
        } catch (e: any) {
            console.error('HLA config not available:', e)
            setHlaRows([])
        } finally {
            setIsHlaLoading(false)
        }
    }, [])

    useEffect(() => { 
        fetchConfig()
        fetchHlaConfig()
    }, [fetchConfig, fetchHlaConfig])

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

    // HLA Config handlers
    const startHlaEdit = (key: string, currentValue: string) => {
        setHlaEditing(prev => new Set(prev).add(key))
        setHlaEdits(prev => ({ ...prev, [key]: currentValue }))
    }

    const cancelHlaEdit = (key: string) => {
        setHlaEditing(prev => { const s = new Set(prev); s.delete(key); return s })
    }

    const handleHlaChange = (key: string, value: string) => {
        setHlaEdits(prev => ({ ...prev, [key]: value }))
    }

    const saveHlaSingle = async (key: string) => {
        const value = hlaEdits[key]
        if (value === undefined) return
        setIsHlaSaving(true)
        try {
            await axiosClient.patch(API_ENDPOINTS.JOBS.PIPELINE_CONFIG_HLA, [{ key, value }])
            setHlaRows(prev => prev.map(r => r.key === key ? { ...r, value } : r))
            cancelHlaEdit(key)
            toast.success(`Saved: ${key}`)
        } catch {
            toast.error('HLA config save failed.')
        } finally {
            setIsHlaSaving(false)
        }
    }

    const saveHlaAll = async () => {
        const payload = Object.entries(hlaEdits).map(([key, value]) => ({ key, value }))
        if (!payload.length) { toast('Nothing to save.'); return }
        setIsHlaSaving(true)
        try {
            await axiosClient.patch(API_ENDPOINTS.JOBS.PIPELINE_CONFIG_HLA, payload)
            setHlaRows(prev => prev.map(r => hlaEdits[r.key] !== undefined ? { ...r, value: hlaEdits[r.key] } : r))
            setHlaEditing(new Set())
            setHlaEdits({})
            toast.success(`Saved ${payload.length} HLA config value(s)`)
        } catch {
            toast.error('HLA config save failed.')
        } finally {
            setIsHlaSaving(false)
        }
    }

    const resetHlaAll = () => {
        setHlaEditing(new Set())
        setHlaEdits({})
        toast('HLA unsaved changes discarded.')
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
                                                                        type={row.key.startsWith('hla_') ? 'number' : 'text'}
                                                                        min={row.key.startsWith('hla_') ? 1 : undefined}
                                                                        max={row.key.startsWith('hla_') ? 100 : undefined}
                                                                        value={edits[row.key] ?? row.value}
                                                                        onChange={e => handleChange(row.key, e.target.value)}
                                                                        className={`w-full px-3 py-1.5 border-2 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white ${
                                                                            (row.key === 'neo_num_cores' && parseInt(edits[row.key] ?? row.value) > 300) ||
                                                                            (row.key.startsWith('hla_') && (parseInt(edits[row.key] ?? row.value) < 1 || parseInt(edits[row.key] ?? row.value) > 100)) ||
                                                                            (!row.key.startsWith('hla_') && row.key !== 'neo_num_cores' && (edits[row.key] ?? row.value).trim() && !(edits[row.key] ?? row.value).trim().toLowerCase().startsWith('s3://'))
                                                                                ? 'border-red-400 focus:ring-red-500'
                                                                                : 'border-teal-400'
                                                                            }`}
                                                                    />
                                                                    {row.key === 'neo_num_cores' && parseInt(edits[row.key] ?? row.value) > 300 && (
                                                                        <p className="text-[10px] text-red-600 font-bold animate-pulse">
                                                                            ⚠ Maximum limit is 300 cores.
                                                                        </p>
                                                                    )}
                                                                    {row.key.startsWith('hla_') && (parseInt(edits[row.key] ?? row.value) < 1 || parseInt(edits[row.key] ?? row.value) > 100) && (
                                                                        <p className="text-[10px] text-red-600 font-bold animate-pulse">
                                                                            ⚠ Value must be between 1 and 100.
                                                                        </p>
                                                                    )}
                                                                    {!row.key.startsWith('hla_') && row.key !== 'neo_num_cores' && (edits[row.key] ?? row.value).trim() && !(edits[row.key] ?? row.value).trim().toLowerCase().startsWith('s3://') && (
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

            {/* HLA Configuration Section - Different Table Design */}
            {!isHlaLoading && hlaRows.length > 0 && (
                <>
                    <div className="flex items-start justify-between mt-12 pt-8 border-t-4 border-emerald-200">
                        <div>
                            <h2 className="text-2xl font-bold text-emerald-800 flex items-center gap-3">
                                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                arcasHLA Configuration
                            </h2>
                            <p className="text-emerald-600 mt-1.5 text-sm font-medium">
                                Stage 1.5 — HLA Typing Pipeline Settings
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {hlaEditing.size > 0 && (
                                <button
                                    onClick={resetHlaAll}
                                    className="flex items-center gap-2 px-4 py-2 border-2 border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors text-sm font-semibold"
                                >
                                    <RotateCcw className="w-4 h-4" /> Discard
                                </button>
                            )}
                            <button
                                onClick={saveHlaAll}
                                disabled={isHlaSaving || hlaEditing.size === 0}
                                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors text-sm font-bold shadow-lg shadow-emerald-200"
                            >
                                <Save className="w-4 h-4" />
                                {isHlaSaving ? 'Saving…' : `Save${hlaEditing.size > 0 ? ` (${hlaEditing.size})` : ''}`}
                            </button>
                        </div>
                    </div>

                    {/* Card-based Table Layout */}
                    <div className="grid gap-4">
                        {hlaRows.map((row) => {
                            const isEdit = hlaEditing.has(row.key)
                            return (
                                <div 
                                    key={row.key} 
                                    className={`rounded-xl border-2 overflow-hidden transition-all ${
                                        isEdit 
                                            ? 'border-amber-400 bg-amber-50/30 shadow-lg' 
                                            : 'border-emerald-200 bg-white hover:border-emerald-300 hover:shadow-md'
                                    }`}
                                >
                                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-6 py-3 border-b-2 border-emerald-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-emerald-900 text-base">{row.label || row.key}</h3>
                                                <p className="text-xs text-emerald-600 font-mono mt-0.5">{row.key}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-emerald-600 font-medium">
                                                    {new Date(row.updated_at).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric'
                                                    })}
                                                </span>
                                                {isEdit ? (
                                                    <>
                                                        <button
                                                            onClick={() => saveHlaSingle(row.key)}
                                                            disabled={isHlaSaving}
                                                            title="Save"
                                                            className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors shadow"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => cancelHlaEdit(row.key)}
                                                            title="Cancel"
                                                            className="p-2 rounded-lg border-2 border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => startHlaEdit(row.key, row.value)}
                                                        title="Edit"
                                                        className="p-2 rounded-lg border-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="px-6 py-4">
                                        {isEdit ? (
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                                    {row.key === 'hla_threads' ? 'Thread Count (1-100)' : 'Configuration Value'}
                                                </label>
                                                <input
                                                    autoFocus
                                                    type={row.key === 'hla_threads' ? 'number' : 'text'}
                                                    min={row.key === 'hla_threads' ? 1 : undefined}
                                                    max={row.key === 'hla_threads' ? 100 : undefined}
                                                    value={hlaEdits[row.key] ?? row.value}
                                                    onChange={e => handleHlaChange(row.key, e.target.value)}
                                                    className={`w-full px-4 py-3 border-2 rounded-lg font-mono text-sm focus:outline-none focus:ring-4 focus:ring-emerald-200 ${
                                                        row.key === 'hla_threads' && (parseInt(hlaEdits[row.key] ?? row.value) < 1 || parseInt(hlaEdits[row.key] ?? row.value) > 100)
                                                            ? 'border-red-400 bg-red-50 focus:ring-red-200'
                                                            : 'border-emerald-300 bg-emerald-50/30'
                                                    }`}
                                                />
                                                {row.key === 'hla_threads' && (parseInt(hlaEdits[row.key] ?? row.value) < 1 || parseInt(hlaEdits[row.key] ?? row.value) > 100) && (
                                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                        <p className="text-xs font-bold">
                                                            Threads must be between 1 and 100
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                    Current Value
                                                </label>
                                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                                                    <span className="font-mono text-sm text-emerald-900 font-semibold break-all">
                                                        {row.value}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}
