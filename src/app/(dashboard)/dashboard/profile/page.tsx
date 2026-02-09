'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/lib/services/auth.service'
import type { User } from '@/types/auth'
import { ProfileContent } from '@/components/features/dashboard/profile-content'
import toast from 'react-hot-toast'

export default function ProfilePage() {
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
        toast.error('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return <ProfileContent user={user} isLoading={isLoading} onUserUpdate={setUser} />
}
