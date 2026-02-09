'use client'

import { Link, Text, Button } from '@/components/ui'
import { Menu, PlusSquare } from 'lucide-react'
import { useUIStore } from '@/store'

export function Header() {
  const { toggleMobileMenu } = useUIStore()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link className="flex items-center gap-2" href="/">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white">
              <PlusSquare />
            </div>
            <Text variant="bold" className="text-2xl font-serif font-bold text-slate-900">
              TINOS
            </Text>
          </Link>
          
          {/* Desktop Menu */}
          {/* <nav className="hidden md:flex items-center gap-8">
            <Link className="text-slate-600 hover:text-teal-600 font-medium transition-colors" href="/specialties">
              Specialties
            </Link>
            <Link className="text-slate-600 hover:text-teal-600 font-medium transition-colors" href="/doctors">
              Doctors
            </Link>
            <Link className="text-slate-600 hover:text-teal-600 font-medium transition-colors" href="/how-it-works">
              How it Works
            </Link>
            <Link className="text-slate-600 hover:text-teal-600 font-medium transition-colors" href="/about">
              About
            </Link>
          </nav> */}
          
          <div className="flex items-center gap-4">
            <Link className="hidden sm:block text-slate-600 hover:text-teal-600 font-bold" href="/login">
              Login
            </Link>
            <Link className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 hidden md:block" href="/#book">
              Book Now
            </Link>
            
            {/* Mobile Toggle */}
            <Button 
              onClick={toggleMobileMenu}
              className="md:hidden text-slate-600"
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
