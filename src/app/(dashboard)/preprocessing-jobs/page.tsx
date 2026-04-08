'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { authService } from '@/lib/services/auth.service'
import type { User } from '@/types/auth'
import { DashboardContent } from '@/components/features/dashboard/dashboard-content'

export default function PreprocessingJobsPage() {
    const { data: session } = useSession()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // SECURITY: Use NextAuth session instead of localStorage.
                if (session) {
                    const s = session as any
                    setUser({
                        id: s?.user?.id || s?.id || s?.sub || '',
                        email: s?.user?.email || s?.email || '',
                        name: s?.user?.name || s?.name || '',
                        date_joined: s?.user?.date_joined || s?.date_joined || '',
                        is_active: s?.user?.is_active ?? s?.is_active ?? true,
                    })
                }

                try {
                    const profileData = await authService.getProfile()
                    setUser(profileData)
                } catch { }
            } catch (error) {
                console.error('Failed to load user data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchUserData()
    }, [session])

    return <DashboardContent user={user} isLoading={isLoading} pipelineType="Preprocessing" />
}
