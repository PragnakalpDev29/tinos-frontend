export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'TINOS',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  description: 'Healthcare that meets you where you are',
} as const

  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsHost = process.env.NEXT_PUBLIC_WS_HOST || window.location.host
  const wsUrl = `${wsProtocol}//${wsHost}/ws/jobs/status/`

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1',
  wsUrl: wsUrl  || 'ws://localhost:8001/ws/jobs/status/',
  timeout: 30000,
} as const

export const FEATURE_FLAGS = {
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const
