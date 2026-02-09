'use client'

import { Button } from '@/components/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { otpSchema, type OTPFormData } from '@/validators/auth'
import { useCallback, useState, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services/auth.service'
import { handleApiError, getFieldErrors } from '@/lib/api/error-handler'

interface Props {
  userId: string
}

export function OTPVerificationForm({ userId }: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...otpDigits]
    const digit = value.slice(-1)
    newDigits[index] = digit

    setOtpDigits(newDigits)

    const otpValue = newDigits.join('')
    form.setValue('otp', otpValue)
    form.clearErrors('otp')

    if (digit && index < 5) {
      const nextInput = inputRefs.current[index + 1]
      nextInput?.focus()
      positionCursorAtEnd(nextInput)
    }
  }

  const positionCursorAtEnd = (input: HTMLInputElement | null) => {
    if (!input) return
    setTimeout(() => {
      const length = input.value.length
      input.setSelectionRange(length, length)
    }, 0)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1]
      prevInput?.focus()
      positionCursorAtEnd(prevInput)
    }

    if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = inputRefs.current[index + 1]
      nextInput?.focus()
      positionCursorAtEnd(nextInput)
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = inputRefs.current[index - 1]
      prevInput?.focus()
      positionCursorAtEnd(prevInput)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('')

    const newDigits = [...otpDigits]
    digits.forEach((digit, i) => {
      if (i < 6) newDigits[i] = digit
    })

    setOtpDigits(newDigits)

    const otpValue = newDigits.join('')
    form.setValue('otp', otpValue)
    form.clearErrors('otp')

    const nextEmptyIndex = newDigits.findIndex((digit) => !digit)
    if (nextEmptyIndex !== -1) {
      const nextInput = inputRefs.current[nextEmptyIndex]
      nextInput?.focus()
      positionCursorAtEnd(nextInput)
    } else if (newDigits[5]) {
      const lastInput = inputRefs.current[5]
      lastInput?.focus()
      positionCursorAtEnd(lastInput)
    }
  }

  const submitOTP = useCallback(
    async (values: OTPFormData) => {
      setIsLoading(true)
      try {
        await authService.verifyOTP(userId, values.otp)

        const response = await signIn('otp', {
          otp: values.otp,
          userId: userId,
          callbackUrl: `${window.location.origin}`,
          redirect: false,
        })

        if (response?.ok) {
          window.location.reload()
          router.push('/dashboard')
        } else {
          form.setError('otp', { message: 'Invalid code! Please try again.' })
        }
      } catch (error) {
        const apiError = handleApiError(error, false)
        
        if (apiError.details) {
          const fieldErrors = getFieldErrors(apiError)
          Object.entries(fieldErrors).forEach(([field, message]) => {
            form.setError(field as keyof OTPFormData, {
              type: 'manual',
              message,
            })
          })
        } else {
          form.setError('otp', { 
            type: 'manual',
            message: apiError.message || 'Invalid code! Please try again.' 
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [router, form, userId]
  )

  const isComplete = otpDigits.every((digit) => digit !== '')

  return (
    <form onSubmit={form.handleSubmit(submitOTP)} className="space-y-6">
      <div className="text-center text-slate-500 text-sm mb-4">
        Enter the 6-digit code from your authenticator app
      </div>

      <div className="w-full flex justify-between gap-x-3 max-w-[420px] mx-auto">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`relative flex items-center justify-center border-2 ${
              form.formState.errors.otp && otpDigits[index]
                ? 'border-red-500'
                : 'border-teal-500'
            } rounded-lg size-12 md:size-14 text-lg transition-all bg-white`}
          >
            <input
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otpDigits[index]}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="absolute inset-0 w-full h-full text-center bg-transparent outline-none rounded-lg"
              onClick={() => positionCursorAtEnd(inputRefs.current[index])}
              onFocus={() => positionCursorAtEnd(inputRefs.current[index])}
              aria-label={`Digit ${index + 1}`}
              disabled={isLoading}
            />
            <span className="pointer-events-none font-semibold">{otpDigits[index]}</span>
          </div>
        ))}
      </div>

      {form.formState.errors.otp && (
        <div className="text-red-500 text-center text-sm" role="alert">
          {form.formState.errors.otp.message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-teal-600 text-white py-5 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isComplete || isLoading}
      >
        {isLoading ? 'Verifying...' : 'Verify'}
      </Button>
    </form>
  )
}
