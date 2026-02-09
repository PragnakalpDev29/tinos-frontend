'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import type { User } from '@/types/auth'

interface DashboardContentProps {
  user: User | null
  isLoading: boolean
}

export function DashboardContent({ user, isLoading }: DashboardContentProps) {
  const stats = [
    {
      title: 'Total Appointments',
      value: '24',
      description: 'This month',
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Pending Reviews',
      value: '8',
      description: 'Awaiting action',
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: '-5%',
      trendUp: false,
    },
    {
      title: 'Completed',
      value: '156',
      description: 'All time',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: '+23%',
      trendUp: true,
    },
    {
      title: 'Active Users',
      value: '1,234',
      description: 'Online now',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      trend: '+8%',
      trendUp: true,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-slate-600 mt-2">
          {isLoading ? 'Loading your account...' : "Here's what's happening with your account today."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} variant="elevated" className="hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</h3>
                  <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span
                  className={`text-sm font-semibold ${
                    stat.trendUp ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.trend}
                </span>
                <span className="text-xs text-slate-500 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
