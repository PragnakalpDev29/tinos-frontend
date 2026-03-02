/**
 * Global Axios Client
 * Use this for all API requests in both Client and Server Components
 * Features: Auto JSON parsing, Interceptors, Token refresh, CSRF handling, Timeout
 */

'use client'

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API || '/'

const isNgrok = BASE_URL.includes('ngrok')

export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(isNgrok ? { 'ngrok-skip-browser-warning': '69420' } : {}),
  },
  withCredentials: true,
})


// Request interceptor - add auth token and CSRF token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
        withCredentials: config.withCredentials,
      })
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }

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

// Response interceptor - handle errors globally and auto token refresh
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }
    return response
  },
  async (error: AxiosError) => {
    // Only log non-401 errors in dev — 401s are expected and handled by token refresh below
    if (process.env.NODE_ENV === 'development' && error.response?.status !== 401) {
      console.error('API Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message,
      })
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken')

          if (refreshToken) {
            const response = await axios.post(
              `/api/auth/token/refresh/`,
              { refresh: refreshToken },
              {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
              }
            )

            const { access, refresh } = response.data
            localStorage.setItem('accessToken', access)
            if (refresh) {
              localStorage.setItem('refreshToken', refresh)
            }

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access}`
            }

            return axiosClient(originalRequest)
          }
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
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
