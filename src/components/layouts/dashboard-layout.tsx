'use client'

import { DashboardSidebar } from './dashboard-sidebar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <main className={cn('flex-1 overflow-auto', className)}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
