'use client'

import { Button, Input, Link } from '@/components/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/validators/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { handleApiError, getFieldErrors } from '@/lib/api/error-handler'
import { authService } from '@/lib/services/auth.service'
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
      // 1. Call custom auth service to set localStorage and accessToken cookie 
      // This is crucial for our Proxy/Middleware to allow access to dashboard routes.
      const authResponse = await authService.login({
        email: data.email,
        password: data.password,
      })

      if (!authResponse?.tokens?.access) {
        throw new Error('No access token received')
      }

      // 2. Call NextAuth signIn to maintain compatibility with components using useSession()
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

        // Previously this did `window.location.href = '/dashboard'` for a full
        // page reload so the middleware would see the fresh cookie. That
        // reload also nuked any in-memory state (e.g. in-flight tus uploads
        // that were paused during sign-out).
        //
        // router.refresh() re-runs server components and middleware with the
        // now-present cookies without destroying the JS context, so Zustand
        // stores survive the logout -> login round trip and the dashboard
        // sidebar's mount effect can call resumeAll() on paused uploads.
        router.replace('/dashboard')
        router.refresh()
      }
    } catch (error: unknown) {
      const apiError = handleApiError(error, false)
      console.error('Login Failure:', apiError)

      if (apiError.details) {
        const fieldErrors = getFieldErrors(apiError)
        Object.entries(fieldErrors || {}).forEach(([field, message]) => {
          setError(field as keyof LoginFormData, {
            type: 'manual',
            message: message as string,
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
      <div className="bg-slate-950/95 rounded-[3rem] p-12 shadow-2xl border border-slate-800/70 text-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold mb-2 text-slate-100">Welcome Back</h1>
          <p className="text-slate-400">Sign in to access your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <Input
              {...register('email')}
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 border border-slate-800 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all"
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
                className="text-xs text-teal-200 font-bold hover:text-[#08333D] hover:underline"
                href="/forgot-password"
              >
                Forgot?
              </Link>
            </div>
            <Input
              {...register('password')}
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 border border-slate-800 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all"
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
            variant="brand"
            className="w-full text-[#08333D] py-5 rounded-full font-bold text-lg transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed brand-btn"
            type="submit"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-10 pt-10 border-t border-slate-800/70 text-center">
          <p className="text-slate-400 mb-4">Don't have an account?</p>
          <Link className="text-teal-200 font-bold hover:text-[#08333D] hover:underline" href="/register">
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
