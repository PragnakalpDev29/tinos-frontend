'use client'

import { Link, Text, Button } from '@/components/ui'
import { Menu, PlusSquare } from 'lucide-react'
import { useUIStore } from '@/store'

export function Header() {
  const { toggleMobileMenu } = useUIStore()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800/70 shadow-sm text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link className="flex items-center gap-3" href="/">
            <div className="w-11 h-11 bg-[#466f78] rounded-full flex items-center justify-center text-[#08333D] shadow-lg shadow-black/20">
              <PlusSquare />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Tinos</p>
              <p className="text-base font-semibold text-slate-100">Therapeutics</p>
            </div>
          </Link>

          {/* Desktop action buttons removed to match main site */}

          <div className="flex items-center justify-end gap-3">
            <Link className="rounded-full border border-slate-700 bg-slate-900 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800" href="#contact">
              Contact
            </Link>
            <Button 
              onClick={toggleMobileMenu}
              className="md:hidden text-slate-100"
              aria-label="Toggle menu"
            >
              <Menu />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
