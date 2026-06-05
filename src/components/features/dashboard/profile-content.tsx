'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import type { User } from '@/types/auth'
import { UserProfileCard } from '@/components/features/dashboard/user-profile-card'
import { useState, useEffect } from 'react'
import { authService } from '@/lib/services/auth.service'
import toast from 'react-hot-toast'

interface ProfileContentProps {
  user: User | null
  isLoading: boolean
  onUserUpdate: (user: User) => void
}

export function ProfileContent({ user, isLoading, onUserUpdate }: ProfileContentProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState(user?.name || '')

  // Sync name field when user data loads asynchronously
  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await authService.updateProfile({ name })
      onUserUpdate(response.user)
      // SECURITY: Do NOT store user data in localStorage.
      // The parent component manages state via React state.
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#08333D]">Profile</h1>
        <p className="text-[#466F78] mt-2">Manage your personal information</p>
      </div>

      <UserProfileCard user={user} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#08333D] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-[#90BCC5]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#08333D] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-4 py-3 border border-[#90BCC5]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#08333D]/40"
                  disabled
                />
                <p className="text-xs text-[#466F78] mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#08333D] mb-2">
                  Member Since
                </label>
                <input
                  type="text"
                  value={user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  className="w-full px-4 py-3 border border-[#90BCC5]/50 rounded-lg bg-[#08333D]/40"
                  disabled
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading || isSaving}
                  className="px-6 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setName(user?.name || '')}
                  disabled={isLoading || isSaving}
                  className="px-6 py-3 border-2 border-[#90BCC5]/50 text-[#08333D] rounded-full font-semibold hover:bg-[#08333D]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-900/30 rounded-lg">
                <span className="text-sm font-semibold text-[#08333D]">Status</span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isLoading
                    ? 'bg-white/20 text-[#466F78]'
                    : user?.is_active !== false
                      ? 'bg-green-900 text-green-400'
                      : 'bg-red-100 text-red-700'
                  }`}>
                  {isLoading ? '...' : user?.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="p-4 bg-[#08333D]/40 rounded-lg">
                <p className="text-sm font-semibold text-[#08333D] mb-1">User ID</p>
                <p className="text-xs text-[#466F78] font-mono">{user?.id || 'Loading...'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
