'use client'

import { useState } from 'react'
import { jobService } from '@/lib/services/job.service'
import toast from 'react-hot-toast'
import { Info, Cpu, FlaskConical, FolderOpen, Database, Check, ChevronRight, AlertTriangle, Clock } from 'lucide-react'

const STAGE1_PATHS = [
    { label: 'DEG Target (DMSO)', value: 's3://epicode-neoantigen/pragnakalp_preprocessing_input/deg/rna/gsc_dmso/' },
    { label: 'DEG Target (JR)', value: 's3://epicode-neoantigen/pragnakalp_preprocessing_input/deg/rna/gsc_jr/' },
    { label: 'GTEx Reference', value: 's3://epicode-neoantigen/pragnakalp_preprocessing_input/deg/gtex/' },
    { label: 'Gencode Reference', value: 's3://epicode-neoantigen/pragnakalp_preprocessing_input/deg/gencode/' },
]

const STAGE1_OUTPUTS = [
    { label: 'Main Results', value: 's3://epicode-neoantigen/pragnakalp_preprocessing_output/results/[job-name]/' },
    { label: 'HLA Output', value: 's3://epicode-neoantigen/pragnakalp_preprocessing_output/hla_output/[job-name]/' },
    { label: 'RNA BAM Output', value: 's3://epicode-neoantigen/pragnakalp_preprocessing_output/rna_bam_output/[job-name]/' },
    { label: 'DEG BAM Consolidated', value: 's3://epicode-neoantigen/pragnakalp_preprocessing_output/deg_bam_consolidated/[job-name]/' },
    { label: 'Logs', value: 's3://epicode-neoantigen/pragnakalp_preprocessing_output/logs_1/[job-name]/' },
]

const STAGE2_CONFIG = [
    { label: 'Instance Type', value: 'm6i.32xlarge' },
    { label: 'Compute Cores', value: '120 vCPUs' },
    { label: 'Memory', value: '512 GB RAM' },
    { label: 'Estimated Runtime', value: '~4 hours' },
]

const STAGE2_OUTPUTS = [
    { label: 'Neoantigen Results', value: 's3://epicode-neoantigen/pragnakalp_preprocessing_output/results/[job-name]/neoantigen_results/' },
    { label: 'Discovery Logs', value: 's3://epicode-neoantigen/pragnakalp_preprocessing_output/logs_1/[job-name]/neoantigen_logs/' },
]

function PathCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</p>
            <p className="text-xs text-slate-600 font-mono break-all">{value}</p>
        </div>
    )
}

export function UnifiedPipelineForm() {
    const [formData, setFormData] = useState({
        job_name: '',
        s3_rna_bam: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [queueFull, setQueueFull] = useState<{ message: string; running: number; queued: number } | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.s3_rna_bam) {
            toast.error('RNA BAM Path is required')
            return
        }

        setIsSubmitting(true)
        setQueueFull(null)  // Clear any previous queue-full banner
        try {
            const response = await jobService.submitPreprocessingJob(formData)
            toast.success(
                <div>
                    <p className="font-bold">Pipeline Started!</p>
                    <p className="text-sm">Stage 1 Job ID: {response.jobId}</p>
                    <p className="text-xs mt-1">Stage 2 will trigger automatically upon success.</p>
                </div>,
                { duration: 6000 }
            )
            setFormData({ job_name: '', s3_rna_bam: '' })
        } catch (error: any) {
            const errData = error?.response?.data
            if (errData?.error === 'queue_full') {
                // Show specific queue-full banner
                setQueueFull({
                    message: errData.message,
                    running: errData.running ?? 0,
                    queued: errData.queued ?? 0,
                })
            } else {
                const errorMessage = errData?.error || errData?.message || error?.message || 'Failed to start pipeline'
                toast.error(errorMessage)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const jobNamePlaceholder = formData.job_name || 'auto-YYYYMMDD-HHMMSS'

    return (
        <div className="max-w-6xl mx-auto space-y-8">

            {/* ── Queue Full Banner ── */}
            {queueFull && (
                <div className="flex items-start gap-4 bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-sm">
                    <div className="flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-amber-900 text-base">Compute Queue is Currently Full</p>
                        <p className="text-sm text-amber-800 mt-1">{queueFull.message}</p>
                        <div className="flex items-center gap-4 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                {queueFull.running} Running
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
                                <Clock className="w-3 h-3" />
                                {queueFull.queued} Waiting
                            </span>
                        </div>
                        <p className="text-xs text-amber-600 mt-2">
                            💡 Go to the <strong>Dashboard</strong> to monitor running jobs. You can retry submission once a job completes.
                        </p>
                    </div>
                    <button
                        onClick={() => setQueueFull(null)}
                        className="text-amber-400 hover:text-amber-600 text-xl font-bold leading-none flex-shrink-0"
                        title="Dismiss"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Form Card */}
            <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                            <Info className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Launch Pipeline</h3>
                            <p className="text-slate-500 text-sm">Only two inputs needed — all other paths are auto-configured.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Job Name */}
                        <div>
                            <label htmlFor="job_name" className="block text-sm font-semibold text-slate-700 mb-2">
                                Job Name <span className="text-slate-400 font-normal italic">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                id="job_name"
                                name="job_name"
                                value={formData.job_name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-400"
                                placeholder="e.g. sample-a-run-1"
                            />
                            <p className="mt-1.5 text-xs text-slate-500">Used to organise all output folders. Defaults to <code className="bg-slate-100 px-1 rounded">{jobNamePlaceholder}</code>.</p>
                        </div>

                        {/* RNA BAM */}
                        <div>
                            <label htmlFor="s3_rna_bam" className="block text-sm font-semibold text-slate-700 mb-2">
                                S3 RNA BAM Path <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="s3_rna_bam"
                                name="s3_rna_bam"
                                value={formData.s3_rna_bam}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-400"
                                placeholder="s3://bucket/path/to/rna-bams/"
                            />
                            <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                                <Info className="w-3 h-3 shrink-0" /> S3 prefix containing all the RNA BAM files to process.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-10 py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:from-teal-700 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-w-[220px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Starting Pipeline…
                                </>
                            ) : (
                                <>
                                    <ChevronRight className="w-5 h-5" />
                                    Start Unified Pipeline
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Pipeline Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stage 1 */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-blue-50">
                        <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</div>
                        <div>
                            <h4 className="font-bold text-slate-800">Preprocessing (Stage 1)</h4>
                            <p className="text-xs text-slate-500">16 vCPUs · ECS · Array Job</p>
                        </div>
                        <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-semibold">Auto-Config</span>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Database className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Input Paths (Static)</p>
                            </div>
                            <div className="space-y-2">
                                {STAGE1_PATHS.map(p => <PathCard key={p.label} {...p} />)}
                                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-teal-500 font-bold flex items-center gap-1">
                                        <Info className="w-3 h-3" /> User Provided
                                    </p>
                                    <p className="text-xs text-teal-700 font-medium">S3 RNA BAM Path — entered above</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Output Paths (Auto-Named)</p>
                            </div>
                            <div className="space-y-2">
                                {STAGE1_OUTPUTS.map(p => <PathCard key={p.label} {...p} />)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stage 2 */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-purple-50">
                        <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</div>
                        <div>
                            <h4 className="font-bold text-slate-800">Neoantigen Discovery (Stage 2)</h4>
                            <p className="text-xs text-slate-500">120 vCPUs · m6i.32xlarge</p>
                        </div>
                        <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Auto-Trigger
                        </span>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Compute Configuration</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {STAGE2_CONFIG.map(p => <PathCard key={p.label} {...p} />)}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Database className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Input Paths (From Stage 1 Output)</p>
                            </div>
                            <div className="space-y-2">
                                <PathCard label="Consolidated RNA BAM" value="→ Taken from Stage 1 rna_bam_output/[job-name]/" />
                                <PathCard label="HLA Typing Results" value="→ Taken from Stage 1 hla_output/[job-name]/" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FlaskConical className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Output Paths (Auto-Named)</p>
                            </div>
                            <div className="space-y-2">
                                {STAGE2_OUTPUTS.map(p => <PathCard key={p.label} {...p} />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
