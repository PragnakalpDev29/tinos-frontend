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
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

        const profileData = await authService.getProfile()
        setUser(profileData)
        localStorage.setItem('user', JSON.stringify(profileData))
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return <DashboardContent user={user} isLoading={isLoading} />
}
