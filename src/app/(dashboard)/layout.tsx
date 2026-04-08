import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  // SECURITY: Server-side authentication check — defense-in-depth
  // Even if JS is disabled or pages are prerendered, unauthenticated users are redirected.
  // This complements the client-side check in DashboardLayout and the proxy.ts middleware.
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }
  return <DashboardLayout>{children}</DashboardLayout>
}
