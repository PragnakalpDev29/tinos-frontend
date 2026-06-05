'use client'

import { Link } from '@/components/ui'
import { useUIStore } from '@/store'

export function MobileMenu() {
  const { mobileMenuOpen } = useUIStore()

  if (!mobileMenuOpen) return null

  return (
    <div className="md:hidden fixed top-20 left-0 w-full bg-slate-950/95 border-b border-slate-800/70 shadow-sm px-4 py-6 flex flex-col gap-4 z-40 text-slate-100">
      <Link className="text-slate-200 hover:text-teal-200 font-medium transition-colors block py-2 text-left" href="/specialties">
        Specialties
      </Link>
      <Link className="text-slate-200 hover:text-teal-200 font-medium transition-colors block py-2 text-left" href="/doctors">
        Doctors
      </Link>
      <Link className="text-slate-200 hover:text-teal-200 font-medium transition-colors block py-2 text-left" href="/how-it-works">
        How it Works
      </Link>
      <Link className="text-slate-200 hover:text-teal-200 font-medium transition-colors block py-2 text-left" href="/about">
        About
      </Link>
      <Link className="text-slate-200 hover:text-teal-200 font-bold block py-2 text-left" href="/login">
        Login
      </Link>
      <Link className="bg-[#466f78] text-white px-6 py-3 rounded-full font-bold hover:bg-[#3b5f67] transition-all shadow-lg shadow-black/20 block text-center" href="/#book">
        Book Now
      </Link>
    </div>
  )
}
