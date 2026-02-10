import { PreprocessingJobForm } from '@/components/features/dashboard/preprocessing-job-form'

export default function PreprocessingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Preprocessing Jobs</h1>
        <p className="text-slate-600 mt-2">
          Submit and manage AWS Batch preprocessing jobs for RNA and DEG BAM files
        </p>
      </div>

      <PreprocessingJobForm />
    </div>
  )
}
