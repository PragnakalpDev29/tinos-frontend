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
      localStorage.setItem('user', JSON.stringify(response.user))
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
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-600 mt-2">Manage your personal information</p>
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
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
                  disabled
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Member Since
                </label>
                <input
                  type="text"
                  value={user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50"
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
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-900">Status</span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isLoading
                    ? 'bg-slate-100 text-slate-500'
                    : user?.is_active !== false
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                  {isLoading ? '...' : user?.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold text-slate-900 mb-1">User ID</p>
                <p className="text-xs text-slate-600 font-mono">{user?.id || 'Loading...'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
