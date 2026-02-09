import { AxiosError } from 'axios'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static fromAxiosError(error: AxiosError): ApiError {
    const response = error.response?.data as any

    if (response?.detail) {
      return new ApiError(response.detail, error.response?.status || 500, response.code)
    }

    if (response?.error) {
      return new ApiError(response.error, error.response?.status || 500, response.code)
    }

    if (response?.non_field_error) {
      return new ApiError(
        response.non_field_error,
        error.response?.status || 500,
        'non_field_error'
      )
    }

    if (response?.non_field_errors && Array.isArray(response.non_field_errors)) {
      return new ApiError(
        response.non_field_errors[0],
        error.response?.status || 500,
        'non_field_errors'
      )
    }

    if (response && typeof response === 'object') {
      const firstKey = Object.keys(response)[0]
      const firstError = response[firstKey]
      const message = Array.isArray(firstError) ? firstError[0] : firstError || 'Validation error'

      return new ApiError(message, error.response?.status || 400, 'validation_error', response)
    }

    return new ApiError(
      error.message || 'An unexpected error occurred',
      error.response?.status || 500
    )
  }

  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
    }
  }
}
