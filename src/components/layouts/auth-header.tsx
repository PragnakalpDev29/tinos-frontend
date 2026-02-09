'use client'

import { Link, Text } from '@/components/ui'
import { PlusSquare } from 'lucide-react'

interface AuthHeaderProps {
  showBackToLogin?: boolean
}

export function AuthHeader({ showBackToLogin = false }: AuthHeaderProps) {
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
          
          <div className="flex items-center gap-4">
            {showBackToLogin ? (
              <Link className="text-slate-600 hover:text-teal-600 font-bold" href="/login">
                Back to Login
              </Link>
            ) : (
              <Link className="text-slate-600 hover:text-teal-600 font-bold" href="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
