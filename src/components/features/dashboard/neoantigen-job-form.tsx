'use client'

import { useState } from 'react'
import { jobService } from '@/lib/services/job.service'
import toast from 'react-hot-toast'

interface NeoantigenJobFormData {
    run_name: string
    cores: number
    s3_base: string
    s3_consolidated_rna_bam?: string
    s3_hla_output?: string
    s3_reference_data?: string
    s3_proteomics_validation?: string
    s3_output?: string
    s3_logs?: string
}

export function NeoantigenJobForm() {
    // SECURITY: Do NOT hardcode S3 bucket paths in frontend code.
    // Use environment variables — these should be configured per deployment.
    const defaultS3Base = process.env.NEXT_PUBLIC_DEFAULT_S3_BASE_PATH || ''

    const [formData, setFormData] = useState<NeoantigenJobFormData>({
        run_name: '',
        cores: 120,
        s3_base: defaultS3Base,
        s3_consolidated_rna_bam: '',
        s3_hla_output: '',
        s3_reference_data: '',
        s3_proteomics_validation: '',
        s3_output: '',
        s3_logs: '',
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'cores' ? parseInt(value) || 120 : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Clean up empty strings for optional fields
            const payload: any = {
                run_name: formData.run_name,
                cores: formData.cores,
                s3_base: formData.s3_base,
            }

            if (formData.s3_consolidated_rna_bam) payload.s3_consolidated_rna_bam = formData.s3_consolidated_rna_bam
            if (formData.s3_hla_output) payload.s3_hla_output = formData.s3_hla_output
            if (formData.s3_reference_data) payload.s3_reference_data = formData.s3_reference_data
            if (formData.s3_proteomics_validation) payload.s3_proteomics_validation = formData.s3_proteomics_validation
            if (formData.s3_output) payload.s3_output = formData.s3_output
            if (formData.s3_logs) payload.s3_logs = formData.s3_logs

            const response = await jobService.submitNeoantigenJob(payload)

            toast.success(
                `Neoantigen job submitted successfully! Job ID: ${response.jobId}`,
                { duration: 5000 }
            )

            setFormData({
                run_name: '',
                cores: 120,
                s3_base: defaultS3Base,
                s3_consolidated_rna_bam: '',
                s3_hla_output: '',
                s3_reference_data: '',
                s3_proteomics_validation: '',
                s3_output: '',
                s3_logs: '',
            })
        } catch (error: any) {
            console.error('Error submitting job:', error)
            const errorMessage = error?.response?.data?.error ||
                error?.message ||
                'Failed to submit neoantigen job'
            toast.error(errorMessage, { duration: 5000 })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Pipeline Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="run_name" className="block text-sm font-medium text-slate-700 mb-2">
                            Run Name
                        </label>
                        <input
                            type="text"
                            id="run_name"
                            name="run_name"
                            value={formData.run_name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="e.g. neo-discovery-01"
                        />
                    </div>

                    <div>
                        <label htmlFor="cores" className="block text-sm font-medium text-slate-700 mb-2">
                            CPU Cores
                        </label>
                        <select
                            id="cores"
                            name="cores"
                            value={formData.cores}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                            <option value={28}>28 Cores</option>
                            <option value={56}>56 Cores</option>
                            <option value={80}>80 Cores</option>
                            <option value={120}>120 Cores</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4">
                    <label htmlFor="s3_base" className="block text-sm font-medium text-slate-700 mb-2">
                        S3 Base Directory (Inputs/Outputs will derive from here)
                    </label>
                    <input
                        type="text"
                        id="s3_base"
                        name="s3_base"
                        value={formData.s3_base}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="s3://bucket/path"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Advanced Overrides (Optional)</h3>
                    <span className="text-xs text-slate-500 italic">Leave blank to use base directory defaults</span>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="s3_consolidated_rna_bam" className="block text-sm font-medium text-slate-700 mb-1 text-xs">
                            Consolidated RNA BAM Override
                        </label>
                        <input
                            type="text"
                            id="s3_consolidated_rna_bam"
                            name="s3_consolidated_rna_bam"
                            value={formData.s3_consolidated_rna_bam}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-400"
                            placeholder="s3://path/to/bam"
                        />
                    </div>

                    <div>
                        <label htmlFor="s3_hla_output" className="block text-sm font-medium text-slate-700 mb-1 text-xs">
                            HLA Output Override
                        </label>
                        <input
                            type="text"
                            id="s3_hla_output"
                            name="s3_hla_output"
                            value={formData.s3_hla_output}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-400"
                            placeholder="s3://path/to/hla"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="s3_output" className="block text-sm font-medium text-slate-700 mb-1 text-xs">
                                S3 Results Path Override
                            </label>
                            <input
                                type="text"
                                id="s3_output"
                                name="s3_output"
                                value={formData.s3_output}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-400"
                                placeholder="s3://path/to/output"
                            />
                        </div>
                        <div>
                            <label htmlFor="s3_logs" className="block text-sm font-medium text-slate-700 mb-1 text-xs">
                                S3 Logs Path Override
                            </label>
                            <input
                                type="text"
                                id="s3_logs"
                                name="s3_logs"
                                value={formData.s3_logs}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-400"
                                placeholder="s3://path/to/logs"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => {
                        if (confirm('Are you sure you want to reset the form?')) {
                            setFormData({
                                run_name: '',
                                cores: 120,
                                s3_base: defaultS3Base,
                                s3_consolidated_rna_bam: '',
                                s3_hla_output: '',
                                s3_reference_data: '',
                                s3_proteomics_validation: '',
                                s3_output: '',
                                s3_logs: '',
                            })
                        }
                    }}
                    className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    Reset
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Neoantigen Job'}
                </button>
            </div>
        </form>
    )
}
