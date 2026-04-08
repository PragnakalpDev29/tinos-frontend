'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { authService } from '@/lib/services/auth.service'
import type { User } from '@/types/auth'
import { ProfileContent } from '@/components/features/dashboard/profile-content'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      // SECURITY: Use NextAuth session as the primary source of truth.
      // Do NOT cache user data in localStorage (XSS-vulnerable).
      if (session) {
        const s = session as any
        const sessionUser: User = {
          id: s?.user?.id || s?.id || s?.sub || '',
          email: s?.user?.email || s?.email || '',
          name: s?.user?.name || s?.name || '',
          date_joined: s?.user?.date_joined || s?.date_joined || '',
          is_active: s?.user?.is_active ?? s?.is_active ?? true,
        }
        setUser(sessionUser)
      }

      // Try to refresh from the Django API
      try {
        const profileData = await authService.getProfile()
        setUser(profileData)
      } catch {
        // Fall back to NextAuth session data (already set above)
      } finally {
        setIsLoading(false)
      }
    }

    if (session !== undefined) fetchUserData()
  }, [session])

  return <ProfileContent user={user} isLoading={isLoading} onUserUpdate={setUser} />
}
