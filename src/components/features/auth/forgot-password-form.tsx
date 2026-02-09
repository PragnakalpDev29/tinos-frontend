'use client'

import { Button, Input, Link } from '@/components/ui'
import { ArrowLeft, Mail } from 'lucide-react'

export function ForgotPasswordForm() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">Forgot Password?</h1>
          <p className="text-slate-500">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <Input
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all"
              type="email"
              placeholder="name@example.com"
            />
          </div>
          
          <Button
            className="w-full bg-teal-600 text-white py-5 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20"
            type="submit"
          >
            Send Reset Link
          </Button>
        </form>
        
        <div className="mt-10 pt-10 border-t border-slate-100">
          <Link 
            className="flex items-center justify-center gap-2 text-slate-600 hover:text-teal-600 font-medium transition-colors"
            href="/login"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm">
          Don't have an account?{' '}
          <Link className="text-teal-600 font-bold hover:underline" href="/register">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
