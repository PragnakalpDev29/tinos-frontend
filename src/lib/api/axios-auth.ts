'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useCallback, useRef } from 'react'
import axios, { AxiosInstance } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API

export const axiosAuth = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

interface FailedRequestQueueItem {
  resolve: (value: any) => void
  reject: (error: any) => void
  config: any
}

const failedRequestsQueue: FailedRequestQueueItem[] = []
let isRefreshingLocal = false

interface UseAxiosAuthReturn {
  axiosAuth: AxiosInstance
  fetcher: (url: string) => Promise<any>
}

const useAxiosAuth = (): UseAxiosAuthReturn => {
  const { data: session, update } = useSession()

  const interceptorsRef = useRef<{
    request: number | null
    response: number | null
  }>({ request: null, response: null })

  useEffect(() => {
    if (session?.user?.access) {
      axiosAuth.defaults.headers.common['Authorization'] = `Bearer ${session.user.access}`
    } else {
      delete axiosAuth.defaults.headers.common['Authorization']
    }
  }, [session])

  useEffect(() => {
    if (interceptorsRef.current.request !== null) {
      return
    }

    const requestIntercept = axiosAuth.interceptors.request.use(
      (config) => {
        if (session?.user?.access) {
          config.headers['Authorization'] = `Bearer ${session.user.access}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    const responseIntercept = axiosAuth.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config

        if (error?.response?.status === 401 && !prevRequest?._retry) {
          prevRequest._retry = true

          if (isRefreshingLocal) {
            return new Promise((resolve, reject) => {
              failedRequestsQueue.push({
                resolve,
                reject,
                config: prevRequest,
              })
            })
          }

          isRefreshingLocal = true

          try {
            const response = await axios.post(
              `${BASE_URL}/api/auth/token/refresh/`,
              { refresh: session?.user?.refresh },
              { headers: { 'Content-Type': 'application/json' } }
            )

            const newToken = response.data.access

            if (newToken) {
              await update({
                ...session,
                user: {
                  ...session?.user,
                  access: newToken,
                },
              })

              prevRequest.headers['Authorization'] = `Bearer ${newToken}`

              failedRequestsQueue.forEach((request) => {
                request.config.headers['Authorization'] = `Bearer ${newToken}`
                request.resolve(axiosAuth(request.config))
              })

              failedRequestsQueue.length = 0
              isRefreshingLocal = false

              return axiosAuth(prevRequest)
            }
          } catch (refreshError) {
            failedRequestsQueue.forEach((request) => {
              request.reject(refreshError)
            })
            failedRequestsQueue.length = 0
            isRefreshingLocal = false
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )

    interceptorsRef.current = {
      request: requestIntercept,
      response: responseIntercept,
    }

    return () => {
      if (interceptorsRef.current.request !== null) {
        axiosAuth.interceptors.request.eject(interceptorsRef.current.request)
      }
      if (interceptorsRef.current.response !== null) {
        axiosAuth.interceptors.response.eject(interceptorsRef.current.response)
      }
      interceptorsRef.current = { request: null, response: null }
    }
  }, [session, update])

  const fetcher = useCallback(
    async (url: string) => {
      try {
        if (session?.user?.access) {
          axiosAuth.defaults.headers.common['Authorization'] = `Bearer ${session.user.access}`
        }
        const response = await axiosAuth.get(url)
        return response.data
      } catch (error: any) {
        throw error
      }
    },
    [session]
  )

  return { axiosAuth, fetcher }
}

export default useAxiosAuth
