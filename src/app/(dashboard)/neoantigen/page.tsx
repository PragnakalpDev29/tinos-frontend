import { NeoantigenJobForm } from '@/components/features/dashboard/neoantigen-job-form'

export default function NeoantigenPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Neoantigen Discovery Pipeline</h1>
                <p className="text-slate-600 mt-2">
                    Submit and manage Neoantigen Discovery Stage 2 jobs using high-core AWS Batch instances.
                </p>
            </div>

            <NeoantigenJobForm />
        </div>
    )
}
