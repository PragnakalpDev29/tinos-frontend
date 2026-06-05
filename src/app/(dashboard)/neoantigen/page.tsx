import { NeoantigenJobForm } from '@/components/features/dashboard/neoantigen-job-form'

export default function NeoantigenPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#08333D]">Neoantigen Discovery Pipeline</h1>
                <p className="text-[#08333D] mt-2">
                    Submit and manage Neoantigen Discovery Stage 2 jobs using high-core AWS Batch instances.
                </p>
            </div>

            <NeoantigenJobForm />
        </div>
    )
}
