'use client'

import { useState } from 'react'
import { jobService } from '@/lib/services/job.service'
import toast from 'react-hot-toast'

interface ArcasHlaFormData {
  s3_input_prefix: string
  s3_output_prefix: string
  threads: number
  job_name: string
}

export function ArcasHlaJobForm() {
  // SECURITY: Do NOT hardcode S3 bucket paths in frontend code.
  // Use environment variables — these should be configured per deployment.
  const defaultS3Input = process.env.NEXT_PUBLIC_DEFAULT_S3_INPUT_PATH || ''
  const defaultS3Output = process.env.NEXT_PUBLIC_DEFAULT_S3_OUTPUT_PATH || ''

  const [formData, setFormData] = useState<ArcasHlaFormData>({
    s3_input_prefix: defaultS3Input,
    s3_output_prefix: defaultS3Output,
    threads: 12,
    job_name: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'threads' ? parseInt(value) || 12 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await jobService.submitArcasHlaJob(formData)

      toast.success(
        `arcasHLA job submitted successfully! Job ID: ${response.jobId}`,
        { duration: 5000 }
      )

      setFormData({
        s3_input_prefix: defaultS3Input,
        s3_output_prefix: defaultS3Output,
        threads: 12,
        job_name: '',
      })
    } catch (error: any) {
      console.error('Error submitting HLA job:', error)
      const errorMessage = error?.response?.data?.error ||
        error?.message ||
        'Failed to submit arcasHLA job'
      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900">arcasHLA Job Configuration</h3>
        </div>
        
        <p className="text-sm text-slate-600 mb-6">
          Submit a standalone HLA typing job using arcasHLA. This job will process BAM files to determine HLA genotypes.
        </p>

        <div className="space-y-6">
          <div>
            <label htmlFor="job_name" className="block text-sm font-medium text-slate-700 mb-2">
              Job Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="job_name"
              name="job_name"
              value={formData.job_name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g. arcas-hla-samples_10"
            />
          </div>

          <div>
            <label htmlFor="s3_input_prefix" className="block text-sm font-medium text-slate-700 mb-2">
              S3 Input Prefix (BAM files location) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="s3_input_prefix"
              name="s3_input_prefix"
              value={formData.s3_input_prefix}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
              placeholder="s3://bucket/path/to/bam-files/"
            />
            <p className="text-xs text-slate-500 mt-1">Directory containing BAM files for HLA typing</p>
          </div>

          <div>
            <label htmlFor="s3_output_prefix" className="block text-sm font-medium text-slate-700 mb-2">
              S3 Output Prefix <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="s3_output_prefix"
              name="s3_output_prefix"
              value={formData.s3_output_prefix}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
              placeholder="s3://bucket/path/to/output/"
            />
            <p className="text-xs text-slate-500 mt-1">Base directory for HLA typing results</p>
          </div>

          <div>
            <label htmlFor="threads" className="block text-sm font-medium text-slate-700 mb-2">
              Threads <span className="text-red-500">*</span>
            </label>
            <select
              id="threads"
              name="threads"
              value={formData.threads}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value={4}>4 Threads</option>
              <option value={8}>8 Threads</option>
              <option value={12}>12 Threads</option>
              <option value={16}>16 Threads</option>
              <option value={24}>24 Threads</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Number of CPU threads per BAM file</p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-emerald-900 mb-2">Output Files</h4>
        <p className="text-xs text-emerald-700">
          Results will be saved to: <code className="bg-emerald-100 px-1 py-0.5 rounded">s3_output_prefix/&lt;job_id&gt;/</code>
        </p>
        <p className="text-xs text-emerald-700 mt-1">
          Expected files: <code className="bg-emerald-100 px-1 py-0.5 rounded">*.genotype.json</code>, 
          <code className="bg-emerald-100 px-1 py-0.5 rounded ml-1">*.genotype.log</code>
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => {
            if (confirm('Are you sure you want to reset the form?')) {
              setFormData({
                s3_input_prefix: defaultS3Input,
                s3_output_prefix: defaultS3Output,
                threads: 12,
                job_name: '',
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
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit arcasHLA Job'
          )}
        </button>
      </div>
    </form>
  )
}
