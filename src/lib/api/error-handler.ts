import { AxiosError } from 'axios'
import { ApiError } from './errors'
import toast from 'react-hot-toast'

export function handleApiError(error: unknown, showToast = true): ApiError {
  let apiError: ApiError

  if (error instanceof AxiosError) {
    apiError = ApiError.fromAxiosError(error)
  } else if (error instanceof ApiError) {
    apiError = error
  } else if (error instanceof Error) {
    apiError = new ApiError(error.message, 500)
  } else {
    apiError = new ApiError('An unexpected error occurred', 500)
  }

  if (showToast) {
    toast.error(apiError.message)
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', apiError.toJSON())
  }

  return apiError
}

export function getFieldErrors(error: ApiError): Record<string, string> {
  if (!error.details) return {}

  const fieldErrors: Record<string, string> = {}
  Object.entries(error.details).forEach(([key, value]) => {
    fieldErrors[key] = Array.isArray(value) ? value[0] : value
  })

  return fieldErrors
}
