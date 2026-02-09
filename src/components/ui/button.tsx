'use client'

import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  contentKey?: string
}

export function Button({ 
  className, 
  children, 
  variant = 'default', 
  size = 'default',
  contentKey,
  ...props 
}: ButtonProps) {
  const variantStyles = {
    default: 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20',
    outline: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50',
    ghost: 'hover:bg-slate-100 text-slate-900',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  }

  const sizeStyles = {
    default: 'px-6 py-3',
    sm: 'px-4 py-2 text-sm',
    lg: 'px-8 py-4 text-lg',
    icon: 'p-2',
  }

  return (
    <button 
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold transition-all',
        variantStyles[variant],
        sizeStyles[size],
        className
      )} 
      {...props}
    >
      {children}
    </button>
  )
}
