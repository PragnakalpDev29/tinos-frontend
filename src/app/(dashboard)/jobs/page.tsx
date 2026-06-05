import Link from 'next/link'

export default function JobsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#08333D]">Jobs</h1>
        <p className="text-[#08333D] text-sm mt-2">
          View and manage all pipeline job runs.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-5 rounded-xl border border-[#90BCC5]/60 bg-white/20 backdrop-blur-md p-6 hover:border-[#466F78] hover:shadow-lg hover:bg-white/35 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#466F78]/40 min-h-[120px]"
        >
          <div className="p-3 rounded-xl bg-[#466F78]/20 text-[#08333D] shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#08333D]">Preprocessing + Neoantigen</h3>
            <p className="text-sm text-[#08333D] font-medium mt-0.5">Once preprocessing finishes, Neoantigen Discovery starts automatically</p>
          </div>
          <span className="ml-auto text-[#08333D] text-lg font-bold">→</span>
        </Link>

        <Link
          href="/m6a-jobs"
          className="flex items-center gap-5 rounded-xl border border-[#90BCC5]/60 bg-white/20 backdrop-blur-md p-6 hover:border-[#466F78] hover:shadow-lg hover:bg-white/35 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#466F78]/40 min-h-[120px]"
        >
          <div className="p-3 rounded-xl bg-[#466F78]/20 text-[#08333D] shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#08333D]">m6A Jobs</h3>
            <p className="text-sm text-[#08333D] font-medium mt-0.5">View all m6A / MeRIP-seq analysis runs</p>
          </div>
          <span className="ml-auto text-[#08333D] text-lg font-bold">→</span>
        </Link>
      </div>
    </div>
  )
}
