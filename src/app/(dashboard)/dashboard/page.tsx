'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/lib/services/auth.service'
import type { User } from '@/types/auth'
import { DashboardContent } from '@/components/features/dashboard/dashboard-content'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Immediately render from cache so the page isn't blank
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

        // Try to refresh from the API — silently skip if it fails (expired token etc)
        try {
          const profileData = await authService.getProfile()
          setUser(profileData)
          localStorage.setItem('user', JSON.stringify(profileData))
        } catch {
          // Profile fetch failed — keep using cached user, token refresh happens automatically
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return <DashboardContent user={user} isLoading={isLoading} pipelineType="Preprocessing" />
}
