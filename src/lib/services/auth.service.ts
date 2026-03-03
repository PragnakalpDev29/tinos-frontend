import { post, get, put } from '@/lib/api/axios-client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
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

export const authService = {
  /**
   * Register a new user
   * POST /api/auth/register/
   */
  register: async (data: RegisterDto): Promise<RegisterResponse> => {
    const response = await post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data)
    console.log("Register response--->", response)
    if (response.tokens?.access) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', response.tokens.access)
          localStorage.setItem('refreshToken', response.tokens.refresh)
          localStorage.setItem('user', JSON.stringify(response.user))
          // Also set a cookie so middleware can detect auth server-side
          document.cookie = `accessToken=${response.tokens.access}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`
        }
      } catch (error) {
        console.error('Failed to store tokens:', error)
      }
    }

    return response
  },

  /**
   * Login user
   * POST /api/auth/login/
   */
  login: async (credentials: LoginDto): Promise<LoginResponse> => {
    const response = await post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)

    if (response.tokens?.access) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', response.tokens.access)
          localStorage.setItem('refreshToken', response.tokens.refresh)
          localStorage.setItem('user', JSON.stringify(response.user))
          // Also set a cookie so middleware can detect auth server-side
          document.cookie = `accessToken=${response.tokens.access}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`
        }
      } catch (error) {
        console.error('Failed to store tokens:', error)
      }
    }

    return response
  },

  /**
   * Logout user (blacklist refresh token)
   * POST /api/auth/logout/
   */
  logout: async (): Promise<LogoutResponse> => {
    try {
      const refreshToken = typeof window !== 'undefined'
        ? localStorage.getItem('refreshToken')
        : null

      if (!refreshToken) {
        throw new Error('No refresh token found')
      }

      const payload: LogoutRequest = { refresh: refreshToken }
      const response = await post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT, payload)

      return response
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        // Also clear the auth cookie used by middleware
        document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax'
      }
    }
  },

  /**
   * Get current user profile
   * GET /api/auth/profile/
   */
  getProfile: async (): Promise<User> => {
    return get<User>(API_ENDPOINTS.AUTH.PROFILE)
  },

  /**
   * Update user profile
   * PUT /api/auth/profile/
   */
  updateProfile: async (data: ProfileUpdateDto): Promise<ProfileUpdateResponse> => {
    return put<ProfileUpdateResponse>(API_ENDPOINTS.AUTH.PROFILE, data)
  },

  /**
   * Change user password
   * POST /api/auth/change-password/
   */
  changePassword: async (data: ChangePasswordDto): Promise<ChangePasswordResponse> => {
    return post<ChangePasswordResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data)
  },

  /**
   * Refresh access token
   * POST /api/auth/token/refresh/
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('refreshToken')
      : null

    if (!refreshToken) {
      throw new Error('No refresh token found')
    }

    const payload: RefreshTokenRequest = { refresh: refreshToken }
    const response = await post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, payload)

    if (response.access) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', response.access)
          if (response.refresh) {
            localStorage.setItem('refreshToken', response.refresh)
          }
          // Update cookie as well
          document.cookie = `accessToken=${response.access}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`
        }
      } catch (error) {
        console.error('Failed to store refreshed token:', error)
      }
    }

    return response
  },
}
