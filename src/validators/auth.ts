import { z } from 'zod'
import { emailSchema, passwordSchema, phoneSchema, nameSchema } from './common'

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Register schema - matches Django backend
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
})

// OTP schema
// export const otpSchema = z.object({
//   otp: z.string().trim().min(6, 'Enter valid OTP').max(6, 'OTP must be 6 digits'),
// })

// Type inference
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
// export type OTPFormData = z.infer<typeof otpSchema>
