'use client'

import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'brand'
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
    default: 'bg-[#08333D] text-[#08333D] hover:bg-[#466F78] shadow-lg shadow-blue-900/20',
    outline: 'border-2 border-teal-500 text-teal-500 hover:bg-[#466F78]/30',
    ghost: 'hover:bg-[#08333D] text-[#08333D]',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    brand: 'bg-[#466f78] text-white hover:bg-[#3b5f67] shadow-lg shadow-black/20',
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
