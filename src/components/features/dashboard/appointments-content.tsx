'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function AppointmentsContent() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#08333D]">Appointments</h1>
        <p className="text-[#466F78] mt-2">Manage your appointments and schedule</p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Your Appointments</CardTitle>
          <CardDescription>View and manage all your scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-[#08333D] mb-2">No appointments yet</h3>
            <p className="text-[#466F78] mb-6">Schedule your first appointment to get started</p>
            <button className="px-6 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-colors">
              Schedule Appointment
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
