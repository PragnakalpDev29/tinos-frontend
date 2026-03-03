'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { User } from '@/types/auth'
import { Mail, Calendar, CheckCircle } from 'lucide-react'

interface UserProfileCardProps {
  user: User | null
  isLoading: boolean
}

export function UserProfileCard({ user, isLoading }: UserProfileCardProps) {
  if (isLoading) {
    return (
      <Card variant="elevated" className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return 'U'
    }
    return name
      .trim()
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  return (
    <Card variant="elevated" className="bg-gradient-to-br from-teal-50 to-white border-teal-100">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {getInitials(user.name)}
            </div>
            {user.is_active && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-md">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {user.name}
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-teal-600" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span className="text-sm">
                  Member since {formatDate(user.date_joined)}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.is_active 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {user.is_active ? 'Active Account' : 'Inactive Account'}
              </span>
              <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">
                ID: {user.id}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
