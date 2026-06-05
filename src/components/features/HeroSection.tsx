import Link from 'next/link'

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 text-slate-900">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,_rgba(116,169,200,0.18),_transparent_32%)]" />
      <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(8,51,61,0.14),_transparent_55%)] blur-3xl opacity-80" />
      <div className="absolute left-1/2 top-64 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(144,188,197,0.20),_transparent_55%)] blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-900 shadow-sm shadow-blue-100/70 backdrop-blur">
              Powered by Epicode™
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-blue-900 sm:text-5xl lg:text-6xl">
              Rewriting RNA’s regulatory code to disrupt tumor survival
            </h1>
            <div className="max-w-xl space-y-4 text-base leading-8 text-slate-700 sm:text-lg">
              <p>
                For more than a decade, our research has mapped how RNA methylation governs cellular survival. That work uncovered a critical dependency in cancer cells on the demethylase FTO.
              </p>
              <p>
                Today, Tinos Tx translates that insight into first-in-class small molecule inhibitors designed to destabilize tumor-driving RNA and collapse cancer from within.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-white/85 p-8 shadow-2xl shadow-blue-200/40 backdrop-blur-xl">
            <div className="grid gap-6 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <p className="font-semibold uppercase tracking-[0.25em] text-blue-900">Programs</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>TN01 series</li>
                  <li>Next-gen FTO inhibitors</li>
                  <li>RNA modification programs</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-[0.25em] text-blue-900">Modality</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>Small molecules</li>
                  <li>Small molecules</li>
                  <li>Future pipeline</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 grid gap-6 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <p className="font-semibold uppercase tracking-[0.25em] text-blue-900">Indication</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>Glioblastoma, Colorectal Cancer, AML</li>
                  <li>Oncology + expansion</li>
                  <li>Undisclosed</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-[0.25em] text-blue-900">Discovery</p>
                <div className="mt-4 h-24 rounded-3xl border border-blue-100 bg-blue-50" />
              </div>
            </div>
            <div className="mt-8 grid gap-6 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <p className="font-semibold uppercase tracking-[0.25em] text-blue-900">Pre-IND</p>
                <div className="mt-4 h-24 rounded-3xl border border-blue-100 bg-blue-50" />
              </div>
              <div>
                <p className="font-semibold uppercase tracking-[0.25em] text-blue-900">Clinical</p>
                <div className="mt-4 h-24 rounded-3xl border border-blue-100 bg-blue-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
