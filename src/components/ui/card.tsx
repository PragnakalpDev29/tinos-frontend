'use client'

import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated'
}

export function Card({ 
  className, 
  children, 
  variant = 'default',
  ...props 
}: CardProps) {
  const variantStyles = {
    default: 'bg-white/55 border border-[#90BCC5]/50 shadow-sm backdrop-blur-md',
    bordered: 'bg-white/55 border border-[#90BCC5]/50 backdrop-blur-md',
    elevated: 'bg-white/55 border border-[#90BCC5]/50 shadow-lg backdrop-blur-md',
  }

  return (
    <div 
      className={cn(
        'rounded-xl p-6',
        variantStyles[variant],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-bold text-[#08333D]', className)} {...props}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-[#466F78]', className)} {...props}>
      {children}
    </p>
  )
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-[#90BCC5]/50', className)} {...props}>
      {children}
    </div>
  )
}
