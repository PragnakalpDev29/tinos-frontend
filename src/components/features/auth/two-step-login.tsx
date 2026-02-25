'use client'

import { Button, Input, Link } from '@/components/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/validators/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { handleApiError, getFieldErrors } from '@/lib/api/error-handler'
import toast from 'react-hot-toast'

export function TwoStepLogin() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (response?.error) {
        toast.error('Invalid email or password')
        setError('password', {
          type: 'manual',
          message: 'Invalid credentials',
        })
      } else if (response?.ok) {
        toast.success('Login successful!')
        router.push('/dashboard')
        router.refresh()
      }
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
        toast.error(apiError.message || 'Login failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-500">Sign in to access your dashboard.</p>
        </div>

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
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <Link
                className="text-xs text-teal-600 font-bold hover:underline"
                href="/forgot-password"
              >
                Forgot?
              </Link>
            </div>
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
            {isLoading || isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-10 pt-10 border-t border-slate-100 text-center">
          <p className="text-slate-500 mb-4">Don't have an account?</p>
          <Link className="text-teal-600 font-bold hover:underline" href="/register">
            Create an Account
          </Link>
        </div>
      </div>

      <p className="text-center text-slate-400 text-xs mt-8">
        By signing in, you agree to our{' '}
        <Link className="underline" href="/terms">
          Terms
        </Link>{' '}
        and{' '}
        <Link className="underline" href="/privacy">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
