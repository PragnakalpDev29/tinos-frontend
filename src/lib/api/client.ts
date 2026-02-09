import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8001'

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data,
      withCredentials: config.withCredentials,
    })
    
    if (typeof window !== 'undefined') {
      // Add JWT token if available
      const token = localStorage.getItem('accessToken')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // Add CSRF token from cookie if available
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

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    })
    return response
  },
  async (error: AxiosError) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    })
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken')
          
          if (refreshToken) {
            // Use apiClient to ensure withCredentials is included
            const response = await axios.post(
              `${BASE_URL}/api/auth/token/refresh/`,
              { refresh: refreshToken },
              { withCredentials: true }
            )

            const { access, refresh } = response.data
            localStorage.setItem('accessToken', access)
            if (refresh) {
              localStorage.setItem('refreshToken', refresh)
            }

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access}`
            }

            return apiClient(originalRequest)
          }
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const get = <T>(url: string, config?: object) =>
  apiClient.get<T>(url, config).then((res) => res.data)

export const post = <T>(url: string, data?: object, config?: object) =>
  apiClient.post<T>(url, data, config).then((res) => res.data)

export const patch = <T>(url: string, data?: object, config?: object) =>
  apiClient.patch<T>(url, data, config).then((res) => res.data)

export const put = <T>(url: string, data?: object, config?: object) =>
  apiClient.put<T>(url, data, config).then((res) => res.data)

export const del = <T>(url: string, config?: object) =>
  apiClient.delete<T>(url, config).then((res) => res.data)
