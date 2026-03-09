'use client'

import { Button, Input, Link } from '@/components/ui'
import { CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/validators/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services/auth.service'
import { handleApiError, getFieldErrors } from '@/lib/api/error-handler'
import toast from 'react-hot-toast'

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    // console.log('Registration form submitted with data:', data)
    
    try {
      // console.log('Calling authService.register...')
      const response = await authService.register(data)
      // console.log('Registration response:', response)
      
      toast.success('Account created successfully! Redirecting to dashboard...')
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error: unknown) {
      console.error('Registration error:', error)
      const apiError = handleApiError(error, false)

      if (apiError.details) {
        const fieldErrors = getFieldErrors(apiError)
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof RegisterFormData, {
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
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold mb-2">Create Your Account</h1>
          {/* <p className="text-slate-500">Join TINOS and get access to quality healthcare</p> */}
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
              Full Name
            </label>
            <Input
              {...register('name')}
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all"
              type="text"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-2">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <Input
              {...register('email')}
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all"
              type="email"
              placeholder="name@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>
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
            />
            {errors.password ? (
              <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>
            ) : (
              <p className="text-xs text-slate-400 mt-2">Must be at least 8 characters</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
              Confirm Password
            </label>
            <Input
              {...register('password_confirm')}
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all"
              type="password"
              placeholder="••••••••"
            />
            {errors.password_confirm && (
              <p className="text-red-500 text-xs mt-2">{errors.password_confirm.message}</p>
            )}
          </div>
          
          {/* <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">Secure and encrypted platform</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">Professional healthcare services</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">24/7 access to your account</p>
            </div>
          </div> */}
          
          <Button
            className="w-full bg-teal-600 text-white py-5 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        
        <div className="mt-10 pt-10 border-t border-slate-100 text-center">
          <p className="text-slate-500">
            Already have an account?{' '}
            <Link className="text-teal-600 font-bold hover:underline" href="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
