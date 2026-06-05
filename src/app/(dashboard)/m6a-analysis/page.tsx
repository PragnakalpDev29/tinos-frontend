import { M6aJobForm } from '@/components/features/dashboard/m6a-job-form'

export default function M6aAnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#08333D]">m6A / MeRIP-seq Analysis</h1>
        <p className="text-[#08333D] mt-2">
          Submit a TRESS differential peak-calling run. Upload your{' '}
          <code className="px-1 bg-slate-100 rounded">baseline/</code> and{' '}
          <code className="px-1 bg-slate-100 rounded">intervention/</code> BAM folders (or provide
          S3 paths). A unique output directory is created for every submission, so runs never
          overwrite each other.
        </p>
      </div>

      <M6aJobForm />
    </div>
  )
}
