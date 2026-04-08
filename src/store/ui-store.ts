import { create } from 'zustand'

// SECURITY: Do NOT store authentication tokens, user data, or PII in this store.
// Use NextAuth session (server-side encrypted cookie) for auth state.
// This store is for UI state only (sidebar, theme, etc.)

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  mobileMenuOpen: boolean
  toggleMobileMenu: () => void
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  mobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}))
