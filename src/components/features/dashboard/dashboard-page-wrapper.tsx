'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/lib/services/auth.service'
import type { User } from '@/types/auth'
import { DashboardContent } from '@/components/features/dashboard/dashboard-content'

export function DashboardPageWrapper() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

        try {
          const profileData = await authService.getProfile()
          setUser(profileData)
          localStorage.setItem('user', JSON.stringify(profileData))
        } catch {
          // Profile fetch failed — keep using cached user
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load user data:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return <DashboardContent user={user} isLoading={isLoading} />
}
