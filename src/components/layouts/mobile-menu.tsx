'use client'

import { Link } from '@/components/ui'
import { useUIStore } from '@/store'

export function MobileMenu() {
  const { mobileMenuOpen } = useUIStore()

  if (!mobileMenuOpen) return null

  return (
    <div className="md:hidden fixed top-20 left-0 w-full bg-white border-b border-slate-100 shadow-sm px-4 py-6 flex flex-col gap-4 z-40">
      <Link className="text-slate-600 hover:text-teal-600 font-medium transition-colors block py-2 text-left" href="/specialties">
        Specialties
      </Link>
      <Link className="text-slate-600 hover:text-teal-600 font-medium transition-colors block py-2 text-left" href="/doctors">
        Doctors
      </Link>
      <Link className="text-slate-600 hover:text-teal-600 font-medium transition-colors block py-2 text-left" href="/how-it-works">
        How it Works
      </Link>
      <Link className="text-slate-600 hover:text-teal-600 font-medium transition-colors block py-2 text-left" href="/about">
        About
      </Link>
      <Link className="text-slate-600 hover:text-teal-600 font-bold block py-2 text-left" href="/login">
        Login
      </Link>
      <Link className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 block text-center" href="/#book">
        Book Now
      </Link>
    </div>
  )
}
