// Global Axios Client - Use this for all API requests
export { 
  axiosClient,
  apiClient,
  get,
  post,
  patch,
  put,
  del,
  axiosGet, 
  axiosPost, 
  axiosPatch, 
  axiosPut, 
  axiosDelete,
  axiosFetcher 
} from './axios-client'

// Fetch utilities for Server Components
export { 
  fetchServer, 
  fetchStatic, 
  fetchDynamic, 
  fetchISR, 
  fetchWithTags,
  postServer,
  putServer,
  patchServer,
  deleteServer
} from './fetch-server'

// Axios with NextAuth integration
export { default as useAxiosAuth, axiosAuth } from './axios-auth'

// Constants and utilities
export { API_ENDPOINTS } from './endpoints'
export { ApiError } from './errors'
export { handleApiError, getFieldErrors } from './error-handler'
