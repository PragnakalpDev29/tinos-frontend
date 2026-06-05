'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useUploadStore, useM6aUploadStore } from '@/store'
import { Upload } from 'lucide-react'

interface MenuItem {
  label: string
  href: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  {
    label: 'Jobs',
    href: '/jobs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Analyses',
    href: '/analyses',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { uploading: preUploading, overallProgress: preProgress } = useUploadStore()
  const { uploading: m6aUploading, overallProgress: m6aProgress } = useM6aUploadStore()

  // On mount (i.e. as soon as a dashboard page renders after sign-in), ask
  // both upload stores to resume any paused tus uploads. If there's nothing
  // paused (normal first-time login) this is a cheap no-op. If the user
  // signed out with uploads in flight earlier this tab-session, they were
  // paused in memory and will now pick up from the exact byte they stopped.
  useEffect(() => {
    try { useUploadStore.getState().resumeAll() } catch { /* ignore */ }
    try { useM6aUploadStore.getState().resumeAll() } catch { /* ignore */ }
  }, [])

  // Each pipeline tracks its uploads in its own store. We surface them
  // side-by-side (stacked rows in the expanded sidebar, stacked mini-badges
  // in the collapsed sidebar) instead of hiding one behind the other, so a
  // user who kicks off a preprocess upload and an m6A upload at the same
  // time can see both progress at once.
  const showPre = preUploading || (preProgress > 0 && preProgress < 100)
  const showM6a = m6aUploading || (m6aProgress > 0 && m6aProgress < 100)
  const showUploadProgress = showPre || showM6a

  return (
    <aside
      className={cn(
        'bg-white/50 border-r border-[#90BCC5]/50 text-[#08333D] transition-all duration-300 backdrop-blur-md',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-[#90BCC5]/40">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-2xl font-bold text-[#08333D]">TINOS</h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors text-[#08333D]"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className={cn('w-5 h-5 transition-transform', isCollapsed && 'rotate-180')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = item.href === '/jobs'
              ? pathname === '/jobs' || pathname === '/dashboard' || pathname.startsWith('/m6a-jobs')
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                  isActive
                    ? 'bg-white/75 text-[#08333D] font-semibold'
                    : 'text-[#08333D] hover:bg-white/50 hover:text-[#08333D]',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Upload Progress Indicator — one row per active pipeline so that
            concurrent preprocess + m6A uploads are both visible. */}
        {showUploadProgress && (
          <div className={cn(
            'mx-4 mb-4 space-y-2',
            isCollapsed && 'flex flex-col items-center mx-2'
          )}>
            {!isCollapsed ? (
              <>
                {showPre && (
                  <div className="p-3 bg-white/50 rounded-xl border border-[#90BCC5]/40 shadow-sm animate-pulse">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-[#08333D] uppercase tracking-wider flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Preprocess
                      </span>
                      <span className="text-[10px] font-black text-[#08333D]">{preProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-teal-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${preProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {showM6a && (
                  <div className="p-3 bg-white/50 rounded-xl border border-[#90BCC5]/40 shadow-sm animate-pulse">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                        <Upload className="w-3 h-3" /> m6A
                      </span>
                      <span className="text-[10px] font-black text-emerald-300">{m6aProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${m6aProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {showPre && (
                  <div className="relative group cursor-help" title={`Preprocess uploading: ${preProgress}%`}>
                    <div className="h-10 w-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 border border-teal-100">
                      <Upload className="w-5 h-5 animate-bounce" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-teal-500 text-[8px] font-bold text-[#08333D] rounded-full flex items-center justify-center">
                      {preProgress}
                    </div>
                  </div>
                )}
                {showM6a && (
                  <div className="relative group cursor-help" title={`m6A uploading: ${m6aProgress}%`}>
                    <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100">
                      <Upload className="w-5 h-5 animate-bounce" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 text-[8px] font-bold text-[#08333D] rounded-full flex items-center justify-center">
                      {m6aProgress}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="p-4 border-t border-[#90BCC5]/40">
          <button
            onClick={async () => {
              // Keep upload state alive across the sign-out → sign-in round
              // trip so the user can pick up exactly where they left off.
              //
              // Steps:
              //   1. pauseAll() aborts the in-flight tus chunk requests but
              //      KEEPS the Upload instances + file blobs in memory.
              //   2. signOut({ redirect: false }) clears the session cookie
              //      without triggering a full page reload, so the Zustand
              //      store (and tus instances) are preserved.
              //   3. DashboardLayout's useEffect detects the unauthenticated
              //      state and soft-redirects to /login, still in the same JS
              //      context. Nothing is reset.
              //
              // When the user signs back in, DashboardSidebar's mount effect
              // below calls resumeAll() on both stores and uploads continue
              // from the exact byte they paused at.
              try { useUploadStore.getState().pauseAll() } catch { /* ignore */ }
              try { useM6aUploadStore.getState().pauseAll() } catch { /* ignore */ }
              try {
                await signOut({ redirect: false })
              } catch {
                // Fall back to a hard sign-out if the soft one fails.
                signOut({ callbackUrl: '/login' })
              }
            }}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-white/65 transition-all w-full',
              isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
