export interface PageAccessConfigType {
  [key: string]: string[]
}

export const PageAccessConfig: PageAccessConfigType = {
  admin: [
    '/dashboard',
    '/dashboard/appointments',
    '/dashboard/profile',
    '/dashboard/settings',
    '/dashboard/users',
    '/dashboard/analytics',
  ],
  doctor: [
    '/dashboard',
    '/dashboard/appointments',
    '/dashboard/profile',
    '/dashboard/settings',
  ],
  user: [
    '/dashboard',
    '/dashboard/appointments',
    '/dashboard/profile',
    '/dashboard/settings',
  ],
}
