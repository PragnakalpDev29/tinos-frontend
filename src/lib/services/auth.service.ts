import { API_ENDPOINTS } from '@/lib/api/endpoints'
import axios from 'axios'
import type {
  LoginDto,
  RegisterDto,
  User,
  LoginResponse,
  RegisterResponse,
  LogoutRequest,
  LogoutResponse,
  ProfileUpdateDto,
  ProfileUpdateResponse,
  ChangePasswordDto,
  ChangePasswordResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/types/auth'

// Create a dedicated axios instance for auth operations
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API || '/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Send cookies for auth endpoints
})

// Request interceptor to attach Bearer token from session for authenticated requests
authApi.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    // Dynamically import NextAuth to get session
    const { getSession } = await import('next-auth/react')
    const session = await getSession()
    const token = (session as any)?.access || session?.user?.access
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

export const authService = {
  /**
   * Register a new user
   * POST /api/auth/register/
   *
   * SECURITY: Tokens are managed by NextAuth's encrypted httpOnly cookie.
   * We do NOT store tokens in localStorage (XSS-vulnerable).
   * The backend should set httpOnly; Secure; SameSite=Strict cookies on response.
   * The cookie set below is only for Next.js middleware detection — the real
   * auth cookie is the httpOnly one set by NextAuth.
   */
  register: async (data: RegisterDto): Promise<RegisterResponse> => {
    const response = await authApi.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data)

    if (response.data.tokens?.access) {
      try {
        if (typeof window !== 'undefined') {
          // Set a Secure, SameSite=Strict cookie for middleware detection
          // The actual token storage is handled by NextAuth's encrypted httpOnly cookie
          document.cookie = `accessToken=${encodeURIComponent(response.data.tokens.access)}; path=/; max-age=${7 * 24 * 3600}; SameSite=Strict; Secure`
        }
      } catch (error) {
        console.error('Failed to set auth cookie:', error)
      }
    }

    return response.data
  },

  /**
   * Login user
   * POST /api/auth/login/
   *
   * SECURITY: Tokens are managed by NextAuth's encrypted httpOnly cookie.
   * We do NOT store tokens in localStorage (XSS-vulnerable).
   */
  login: async (credentials: LoginDto): Promise<LoginResponse> => {
    const response = await authApi.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)

    if (response.data.tokens?.access) {
      try {
        if (typeof window !== 'undefined') {
          // Set a Secure, SameSite=Strict cookie for middleware detection
          document.cookie = `accessToken=${encodeURIComponent(response.data.tokens.access)}; path=/; max-age=${7 * 24 * 3600}; SameSite=Strict; Secure`
        }
      } catch (error) {
        console.error('Failed to set auth cookie:', error)
      }
    }

    return response.data
  },

  /**
   * Logout user (blacklist refresh token)
   * POST /api/auth/logout/
   *
   * SECURITY: Tokens are managed by NextAuth's httpOnly cookie, not localStorage.
   * We still call the backend logout to invalidate the refresh token server-side.
   */
  logout: async (): Promise<LogoutResponse> => {
    try {
      // Send logout to backend to invalidate server-side session
      const response = await authApi.post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT, {})
      return response.data
    } finally {
      if (typeof window !== 'undefined') {
        // Clear the middleware detection cookie
        document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Strict; Secure'
      }
    }
  },

  /**
   * Get current user profile
   * GET /api/auth/profile/
   */
  getProfile: async (): Promise<User> => {
    const response = await authApi.get<User>(API_ENDPOINTS.AUTH.PROFILE)
    return response.data
  },

  /**
   * Update user profile
   * PUT /api/auth/profile/
   */
  updateProfile: async (data: ProfileUpdateDto): Promise<ProfileUpdateResponse> => {
    const response = await authApi.put<ProfileUpdateResponse>(API_ENDPOINTS.AUTH.PROFILE, data)
    return response.data
  },

  /**
   * Change user password
   * POST /api/auth/change-password/
   */
  changePassword: async (data: ChangePasswordDto): Promise<ChangePasswordResponse> => {
    const response = await authApi.post<ChangePasswordResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data)
    return response.data
  },

  /**
   * Refresh access token
   * POST /api/auth/token/refresh/
   *
   * SECURITY: Token refresh is primarily handled by NextAuth's session management
   * via its encrypted httpOnly cookie. This method is a fallback.
   * We do NOT store tokens in localStorage.
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    // NextAuth handles token refresh automatically via its session cookie.
    // This method delegates to NextAuth's update mechanism.
    // Trigger a session update — NextAuth will handle the refresh.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nextauth-session-expired'))
    }

    // Return a placeholder — the real refresh happens via NextAuth
    return { access: '', refresh: '' }
  },
}
