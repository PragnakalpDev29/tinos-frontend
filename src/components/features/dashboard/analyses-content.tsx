'use client'

import Link from 'next/link'

const ACCENT = {
  teal: {
    icon: 'bg-[#466F78]/20 text-[#08333D]',
    border: 'border-[#90BCC5]/60',
    hover: 'hover:border-[#466F78] hover:shadow-xl hover:bg-white/65',
    btn: 'bg-[#466F78] text-white hover:bg-[#466F78]/80',
    badge: 'bg-emerald-100 text-emerald-700',
    divider: 'border-[#90BCC5]/40',
  },
  purple: {
    icon: 'bg-purple-100/70 text-purple-700',
    border: 'border-purple-200/60',
    hover: 'hover:border-purple-400 hover:shadow-xl hover:bg-white/65',
    btn: 'bg-purple-600 text-white hover:bg-purple-700',
    badge: 'bg-purple-100 text-purple-700',
    divider: 'border-purple-200/40',
  },
}

export function AnalysesContent() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#08333D]">Analyses</h1>
        <p className="text-[#08333D] text-sm mt-2">
          Select an analysis type to open its submission form and job history.
        </p>
      </div>

      {/* Top row — 2 equal analysis cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* Preprocessing + Neoantigen Card */}
        <Link
          href="/preprocessing"
          className={`group flex flex-col rounded-xl border ${ACCENT.teal.border} bg-white/50 backdrop-blur-md p-8 transition-all duration-200 ${ACCENT.teal.hover} focus:outline-none focus:ring-2 focus:ring-[#466F78]/40 min-h-[240px]`}
        >
          <div className="flex items-start gap-5 flex-1">
            <div className={`p-4 rounded-xl shrink-0 ${ACCENT.teal.icon}`}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-[#08333D]">Preprocessing + Neoantigen</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ACCENT.teal.badge}`}>Available</span>
              </div>
              <p className="text-sm font-semibold text-[#08333D] mb-3">End-to-End Pipeline</p>
              <p className="text-sm text-[#08333D] font-medium leading-relaxed">
                Submit a preprocessing run. Upload BAM files and configure compute settings to start the pipeline.
              </p>
              <p className="text-xs text-[#466F78] font-semibold mt-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Once preprocessing finishes, Neoantigen Discovery starts automatically
              </p>
            </div>
          </div>
          <div className={`mt-6 pt-4 border-t ${ACCENT.teal.divider} flex items-center justify-between`}>
            <Link
              href="/pipeline-config"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-semibold text-[#466F78] hover:text-[#08333D] flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h7" />
              </svg>
              Pipeline Config
            </Link>
            <span className={`text-sm font-semibold px-6 py-2 rounded-lg transition-colors ${ACCENT.teal.btn}`}>
              Open →
            </span>
          </div>
        </Link>

        {/* m6A Card */}
        <Link
          href="/m6a-analysis"
          className={`group flex flex-col rounded-xl border ${ACCENT.teal.border} bg-white/50 backdrop-blur-md p-8 transition-all duration-200 ${ACCENT.teal.hover} focus:outline-none focus:ring-2 focus:ring-[#466F78]/40 min-h-[240px]`}
        >
          <div className="flex items-start gap-5 flex-1">
            <div className={`p-4 rounded-xl shrink-0 ${ACCENT.teal.icon}`}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-[#08333D]">m6A / MeRIP-seq</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ACCENT.teal.badge}`}>Available</span>
              </div>
              <p className="text-sm font-semibold text-[#08333D] mb-3">Differential Peak Analysis</p>
              <p className="text-sm text-[#08333D] font-medium leading-relaxed">
                Submit a TRESS differential peak-calling run. Upload baseline and intervention BAM folders or provide S3 paths.
              </p>
            </div>
          </div>
          <div className={`mt-6 pt-4 border-t ${ACCENT.teal.divider} flex justify-end`}>
            <span className={`text-sm font-semibold px-6 py-2 rounded-lg transition-colors ${ACCENT.teal.btn}`}>
              Open →
            </span>
          </div>
        </Link>
      </div>

    </div>
  )
}
