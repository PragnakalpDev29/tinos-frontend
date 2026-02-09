import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error'
  contentKey?: string
}

export function Badge({ 
  className, 
  children, 
  variant = 'default', 
  contentKey, 
  ...props 
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-900',
    success: 'bg-green-100 text-green-900',
    warning: 'bg-orange-100 text-orange-900',
    error: 'bg-red-100 text-red-900',
  }

  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
        variantStyles[variant],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}
