'use client'

import { useState } from 'react'
import { jobService } from '@/lib/services/job.service'
import toast from 'react-hot-toast'

interface PreprocessingJobFormData {
  jobName: string
  jobType: 'SINGLE' | 'ARRAY'
  status: 'SUBMITTED' | 'PENDING' | 'RUNNABLE' | 'STARTING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  s3RnaBam: string
  s3DegBam: string
  s3DegJr: string
  s3Gtex: string
  s3Gencode: string
  s3OutputBucket: string
  s3HlaOutput: string
  s3RnaBamOutput: string
  s3DegBamConsolidated: string
  s3LogsBucket: string
  fileCount: number
}

export function PreprocessingJobForm() {
  const [formData, setFormData] = useState<PreprocessingJobFormData>({
    jobName: '',
    jobType: 'SINGLE',
    status: 'SUBMITTED',
    s3RnaBam: '',
    s3DegBam: '',
    s3DegJr: '',
    s3Gtex: '',
    s3Gencode: '',
    s3OutputBucket: '',
    s3HlaOutput: '',
    s3RnaBamOutput: '',
    s3DegBamConsolidated: '',
    s3LogsBucket: '',
    fileCount: 1,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [s3Validation, setS3Validation] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid'
    message?: string
    fileCount?: number
    files?: string[]
  }>({ status: 'idle' })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fileCount' ? parseInt(value) || 1 : value
    }))
    // Reset validation when S3 RNA BAM path changes
    if (name === 's3RnaBam') {
      setS3Validation({ status: 'idle' })
    }
  }

  const validateS3Path = async (s3Path: string) => {
    setS3Validation({ status: 'checking' })
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || ''
      const isNgrok = backendUrl.includes('ngrok')
      const response = await fetch(`${backendUrl}/proxy/api/validate-s3-path/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isNgrok ? { 'ngrok-skip-browser-warning': '69420' } : {}),
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''}`,
        },
        body: JSON.stringify({ s3_path: s3Path }),
      })

      const data = await response.json()
      if (data.valid) {
        setS3Validation({
          status: 'valid',
          message: data.message,
          fileCount: data.file_count,
          files: data.files,
        })
      } else {
        setS3Validation({ status: 'invalid', message: data.error || 'No BAM files found at the specified path.' })
      }
      return data.valid
    } catch (err) {
      setS3Validation({ status: 'invalid', message: 'Could not connect to server to validate S3 path.' })
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.s3RnaBam.trim()) {
      toast.error('S3 RNA BAM Path is required.')
      return
    }

    setIsSubmitting(true)
    try {
      // Step 1: Validate the S3 path first
      const isValid = await validateS3Path(formData.s3RnaBam)
      if (!isValid) {
        const msg = s3Validation.status === 'invalid' ? s3Validation.message : 'No BAM files found at the specified S3 path.'
        toast.error(msg || 'Invalid S3 path.', { duration: 6000 })
        setIsSubmitting(false)
        return
      }

      // Step 2: Submit the job
      const payload = {
        s3_rna_bam: formData.s3RnaBam,
        s3_deg_bam: formData.s3DegBam,
        s3_deg_jr: formData.s3DegJr,
        s3_gtex: formData.s3Gtex,
        s3_gencode: formData.s3Gencode,
        s3_output_bucket: formData.s3OutputBucket,
        s3_hla_output: formData.s3HlaOutput,
        s3_rna_bam_output: formData.s3RnaBamOutput,
        s3_deg_bam_consolidated: formData.s3DegBamConsolidated,
        s3_logs_bucket: formData.s3LogsBucket,
      }

      const response = await jobService.submitPreprocessingJob(payload)

      toast.success(
        `Job submitted successfully! Job ID: ${response.jobId}`,
        { duration: 5000 }
      )

      console.log('Job submission response:', response)
      setS3Validation({ status: 'idle' })
      setFormData({
        jobName: '',
        jobType: 'SINGLE',
        status: 'SUBMITTED',
        s3RnaBam: '',
        s3DegBam: '',
        s3DegJr: '',
        s3Gtex: '',
        s3Gencode: '',
        s3OutputBucket: '',
        s3HlaOutput: '',
        s3RnaBamOutput: '',
        s3DegBamConsolidated: '',
        s3LogsBucket: '',
        fileCount: 1,
      })
    } catch (error: any) {
      console.error('Error submitting job:', error)
      const errorMessage = error?.response?.data?.error ||
        error?.message ||
        'Failed to submit preprocessing job'
      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Information</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="jobName" className="block text-sm font-medium text-slate-700 mb-2">
              Job Name
            </label>
            <input
              type="text"
              id="jobName"
              name="jobName"
              value={formData.jobName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter job name"
            />
          </div>

          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-slate-700 mb-2">
              Job Type
            </label>
            <select
              id="jobType"
              name="jobType"
              value={formData.jobType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="SINGLE">Single Job</option>
              <option value="ARRAY">Array Job</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="SUBMITTED">Submitted</option>
              <option value="PENDING">Pending</option>
              <option value="RUNNABLE">Runnable</option>
              <option value="STARTING">Starting</option>
              <option value="RUNNING">Running</option>
              <option value="SUCCEEDED">Succeeded</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <label htmlFor="fileCount" className="block text-sm font-medium text-slate-700 mb-2">
              File Count
            </label>
            <input
              type="number"
              id="fileCount"
              name="fileCount"
              value={formData.fileCount}
              onChange={handleInputChange}
              min="1"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Number of BAM files to process"
            />
          </div>
        </div>
      </div> */}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">S3 Input Paths</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="s3RnaBam" className="block text-sm font-medium text-slate-700 mb-2">
              S3 RNA BAM Path
            </label>
            <input
              type="text"
              id="s3RnaBam"
              name="s3RnaBam"
              value={formData.s3RnaBam}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${s3Validation.status === 'valid' ? 'border-green-400 bg-green-50' :
                s3Validation.status === 'invalid' ? 'border-red-400 bg-red-50' :
                  'border-slate-300'
                }`}
              placeholder="s3://bucket-name/path/to/rna-bam"
            />
            {s3Validation.status === 'checking' && (
              <p className="mt-1 text-sm text-blue-600 flex items-center gap-1">
                <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full"></span>
                Checking S3 path for BAM files...
              </p>
            )}
            {s3Validation.status === 'valid' && (
              <p className="mt-1 text-sm text-green-700 font-medium">
                ✅ {s3Validation.message}
              </p>
            )}
            {s3Validation.status === 'invalid' && (
              <p className="mt-1 text-sm text-red-600 font-medium">
                ❌ {s3Validation.message}
              </p>
            )}
          </div>


          <div>
            <label htmlFor="s3DegBam" className="block text-sm font-medium text-slate-700 mb-2">
              S3 DEG BAM Path
            </label>
            <input
              type="text"
              id="s3DegBam"
              name="s3DegBam"
              value={formData.s3DegBam}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="s3://bucket-name/path/to/deg-bam"
            />
          </div>

          <div>
            <label htmlFor="s3DegJr" className="block text-sm font-medium text-slate-700 mb-2">
              S3 DEG JR Path
            </label>
            <input
              type="text"
              id="s3DegJr"
              name="s3DegJr"
              value={formData.s3DegJr}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="s3://bucket-name/path/to/deg-jr"
            />
          </div>

          <div>
            <label htmlFor="s3Gtex" className="block text-sm font-medium text-slate-700 mb-2">
              S3 GTEX Path
            </label>
            <input
              type="text"
              id="s3Gtex"
              name="s3Gtex"
              value={formData.s3Gtex}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="s3://bucket-name/path/to/gtex"
            />
          </div>

          <div>
            <label htmlFor="s3Gencode" className="block text-sm font-medium text-slate-700 mb-2">
              S3 GENCODE Path
            </label>
            <input
              type="text"
              id="s3Gencode"
              name="s3Gencode"
              value={formData.s3Gencode}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="s3://bucket-name/path/to/gencode"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">S3 Output Paths</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="s3OutputBucket" className="block text-sm font-medium text-slate-700 mb-2">
              S3 Main Output Path
            </label>
            <input
              type="text"
              id="s3OutputBucket"
              name="s3OutputBucket"
              value={formData.s3OutputBucket}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="s3://bucket-name/output"
            />
          </div>

          <div>
            <label htmlFor="s3HlaOutput" className="block text-sm font-medium text-slate-700 mb-2">
              S3 HLA Output Path
            </label>
            <input
              type="text"
              id="s3HlaOutput"
              name="s3HlaOutput"
              value={formData.s3HlaOutput}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="s3://bucket-name/output/hla"
            />
          </div>

          <div>
            <label htmlFor="s3RnaBamOutput" className="block text-sm font-medium text-slate-700 mb-2">
              S3 RNA BAM Output Path
            </label>
            <input
              type="text"
              id="s3RnaBamOutput"
              name="s3RnaBamOutput"
              value={formData.s3RnaBamOutput}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="s3://bucket-name/output/rna-bam"
            />
          </div>

          <div>
            <label htmlFor="s3DegBamConsolidated" className="block text-sm font-medium text-slate-700 mb-2">
              S3 DEG BAM Consolidated Output Path
            </label>
            <input
              type="text"
              id="s3DegBamConsolidated"
              name="s3DegBamConsolidated"
              value={formData.s3DegBamConsolidated}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="s3://bucket-name/output/deg-bam-consolidated"
            />
          </div>

          <div>
            <label htmlFor="s3LogsBucket" className="block text-sm font-medium text-slate-700 mb-2">
              S3 Logs Bucket Path
            </label>
            <input
              type="text"
              id="s3LogsBucket"
              name="s3LogsBucket"
              value={formData.s3LogsBucket}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="s3://bucket-name/logs"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => {
            if (confirm('Are you sure you want to reset the form?')) {
              setFormData({
                jobName: '',
                jobType: 'SINGLE',
                status: 'SUBMITTED',
                s3RnaBam: '',
                s3DegBam: '',
                s3DegJr: '',
                s3Gtex: '',
                s3Gencode: '',
                s3OutputBucket: '',
                s3HlaOutput: '',
                s3RnaBamOutput: '',
                s3DegBamConsolidated: '',
                s3LogsBucket: '',
                fileCount: 1,
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
          {isSubmitting ? 'Submitting...' : 'Submit Job'}
        </button>
      </div>

    </form>
  )
}
