'use client'

import { Button, Input } from '@/components/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/validators/auth'
import { useState, useCallback } from 'react'
import { authService } from '@/lib/services/auth.service'
import { handleApiError, getFieldErrors } from '@/lib/api/error-handler'
import { ApiError } from '@/lib/api/errors'
import toast from 'react-hot-toast'

interface Props {
  onSuccess?: () => void
  setUserId?: (userId: string) => void
}

export function PasswordLoginForm({ onSuccess, setUserId }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = useCallback(
    async (values: LoginFormData) => {
      setIsLoading(true)
      try {
        const response = await authService.authenticate(values)

        const uid = response.user_id || ''
        if (setUserId) setUserId(uid)

        toast.success('Password verified successfully')
        if (onSuccess) onSuccess()
      } catch (error: unknown) {
        const apiError = handleApiError(error, false)

        if (apiError.details) {
          const fieldErrors = getFieldErrors(apiError)
          Object.entries(fieldErrors).forEach(([field, message]) => {
            setError(field as keyof LoginFormData, {
              type: 'manual',
              message,
            })
          })
        } else {
          toast.error(apiError.message)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess, setUserId, setError]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
          Email Address
        </label>
        <Input
          {...register('email')}
          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all"
          type="email"
          placeholder="name@example.com"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-2" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
          Password
        </label>
        <Input
          {...register('password')}
          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all"
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-2" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        className="w-full bg-teal-600 text-white py-5 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={isLoading || isSubmitting}
      >
        {isLoading ? 'Signing In...' : 'Continue'}
      </Button>
    </form>
  )
}
