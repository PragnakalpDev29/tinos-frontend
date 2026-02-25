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
      // 1. Use cached localStorage user immediately (fastest)
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          // ignore malformed cache
        }
      }

      // 2. Try to refresh from the Django API
      try {
        const profileData = await authService.getProfile()
        setUser(profileData)
        localStorage.setItem('user', JSON.stringify(profileData))
      } catch {
        // 3. Fall back to NextAuth session — fields are spread at root level
        //    (authOptions does `session = token as any`, so session.id, session.email etc.)
        if (!storedUser) {
          const s = session as any
          const fallbackUser: User = {
            id: s?.id || s?.sub || '',
            email: s?.email || '',
            name: s?.name || '',
            date_joined: s?.date_joined || '',
            is_active: s?.is_active ?? true,
          }
          setUser(fallbackUser)
          localStorage.setItem('user', JSON.stringify(fallbackUser))
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (session !== undefined) fetchUserData()
  }, [session])

  return <ProfileContent user={user} isLoading={isLoading} onUserUpdate={setUser} />
}
