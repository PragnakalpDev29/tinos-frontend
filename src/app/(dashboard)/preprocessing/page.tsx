import { UnifiedPipelineForm } from '@/components/features/dashboard/unified-job-form'

export default function PreprocessingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#08333D]">Start Pipeline</h1>
        <p className="text-[#08333D] mt-2">
          Submit the consolidated BAM file to start both Stage 1 (Preprocessing) and Stage 2 (Neoantigen Discovery) automatically.
        </p>
      </div>

      <UnifiedPipelineForm />
    </div>
  )
}
