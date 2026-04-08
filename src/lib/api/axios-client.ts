/**
 * Global Axios Client
 * Use this for all API requests in both Client and Server Components
 * Features: Auto JSON parsing, Interceptors, CSRF handling, Timeout
 *
 * SECURITY: Authentication is handled via httpOnly cookies managed by NextAuth.
 * We do NOT read tokens from localStorage (XSS-vulnerable).
 * The `withCredentials: true` option ensures cookies are sent automatically.
 */

'use client'

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API || '/'

export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})


// Request interceptor - add CSRF token only (auth via httpOnly cookie)
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // Extract CSRF token from Django's csrftoken cookie for double-submit pattern
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1]

      if (csrfToken && config.headers) {
        config.headers['X-CSRFToken'] = csrfToken
      }
    }

    return config
  },
  (error: AxiosError) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors globally
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    // Only log non-401 errors in dev
    if (process.env.NODE_ENV === 'development' && error.response?.status !== 401) {
      console.error('API Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message,
      })
    }

    // On 401, trigger NextAuth session update and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Dispatch event for NextAuth to handle session refresh
        window.dispatchEvent(new CustomEvent('nextauth-session-expired'))
        // Clear the middleware detection cookie
        document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Strict; Secure'
      }
    }

    return Promise.reject(error)
  }
)

// Legacy exports (for backward compatibility)
export const apiClient = axiosClient

export const get = <T>(url: string, config?: object) =>
  axiosClient.get<T>(url, config).then((res) => res.data)

export const post = <T>(url: string, data?: object, config?: object) =>
  axiosClient.post<T>(url, data, config).then((res) => res.data)

export const patch = <T>(url: string, data?: object, config?: object) =>
  axiosClient.patch<T>(url, data, config).then((res) => res.data)

export const put = <T>(url: string, data?: object, config?: object) =>
  axiosClient.put<T>(url, data, config).then((res) => res.data)

export const del = <T>(url: string, config?: object) =>
  axiosClient.delete<T>(url, config).then((res) => res.data)

// New helper functions (recommended for new code)
export const axiosGet = get
export const axiosPost = post
export const axiosPatch = patch
export const axiosPut = put
export const axiosDelete = del

// Axios fetcher for SWR
export const axiosFetcher = (url: string) => axiosClient.get(url).then(res => res.data)
