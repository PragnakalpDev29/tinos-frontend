import { PageAccessConfig } from '@/lib/constants/roles'
import { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import toast from 'react-hot-toast'

interface ErrorResponseData {
  error?: string
  non_field_error?: string
  [key: string]: any
}

export function hasAccess(role: string, route: string): boolean {
  const allowedRoutes = PageAccessConfig[role]
  if (!allowedRoutes) {
    return false
  }
  return allowedRoutes.some((allowedRoute) => route.startsWith(allowedRoute))
}

export const getAxiosError = (error: any): string | object => {
  if (error.response && error.response.data) {
    const data = error.response.data as ErrorResponseData
    if (data.error) {
      return data.error
    } else if (data.non_field_error) {
      return data.non_field_error
    } else if (data.non_field_errors) {
      return data.non_field_errors[0]
    } else {
      return error.response.data
    }
  } else {
    return 'Something went wrong'
  }
}

export const handleFormErrors = <T extends FieldValues>(
  error: any,
  form: UseFormReturn<T>
) => {
  const _error = getAxiosError(error)

  if (typeof _error === 'string') {
    toast.error(_error)
  } else {
    Object.entries(_error).forEach(([key, value]) => {
      if (form.getValues()[key as Path<T>] !== undefined) {
        form.setError(key as Path<T>, {
          type: 'custom',
          message: Array.isArray(value) ? value[0] : (value as string),
        })
      }
    })

    setTimeout(() => {
      const errorElements = document.querySelectorAll('[role="alert"]')
      if (errorElements.length > 0) {
        errorElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }
}
