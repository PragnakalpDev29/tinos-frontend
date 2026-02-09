'use client'

import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error'
  contentKey?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', contentKey, ...props }, ref) => {
    const variantStyles = {
      default: 'border-slate-200 focus:ring-teal-500',
      error: 'border-red-500 focus:ring-red-500',
    }

    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-full border bg-white px-4 py-3 text-slate-900 transition-all',
          'focus:outline-none focus:ring-2',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
