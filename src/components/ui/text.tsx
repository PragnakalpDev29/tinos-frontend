import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'bold' | 'muted'
  contentKey?: string
}

export function Text({ 
  className, 
  children, 
  variant = 'default', 
  contentKey, 
  ...props 
}: TextProps) {
  const variantStyles = {
    default: '',
    bold: 'font-bold',
    muted: 'text-slate-500',
  }

  return (
    <span 
      className={cn(variantStyles[variant], className)} 
      {...props}
    >
      {children}
    </span>
  )
}
