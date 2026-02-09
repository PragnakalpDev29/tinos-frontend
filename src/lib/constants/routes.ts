export const ROUTES = {
  HOME: '/',
  
  // Marketing routes
  ABOUT: '/about',
  CONTACT: '/contact',
  DOCTORS: '/doctors',
  DOCTOR_PROFILE: '/doctor-profile',
  FAQ: '/faq',
  HOW_IT_WORKS: '/how-it-works',
  PRICING: '/pricing',
  SPECIALTIES: '/specialties',
  SPECIALTY_DETAIL: '/specialty-detail',
  
  // Legal routes
  PRIVACY: '/privacy',
  TERMS: '/terms',
  
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Dashboard routes (future)
  DASHBOARD: '/dashboard',
  APPOINTMENTS: '/dashboard/appointments',
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',
} as const

export type RouteKey = keyof typeof ROUTES
export type RouteValue = typeof ROUTES[RouteKey]
