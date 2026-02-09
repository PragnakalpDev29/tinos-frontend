'use client'

import { Button, Input, Link } from '@/components/ui'
import { CheckCircle, Lock } from 'lucide-react'

export function ResetPasswordForm() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">Reset Password</h1>
          <p className="text-slate-500">
            Enter your new password below
          </p>
        </div>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
              New Password
            </label>
            <Input
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all"
              type="password"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
              Confirm New Password
            </label>
            <Input
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all"
              type="password"
              placeholder="••••••••"
            />
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-6 space-y-2">
            <p className="text-sm font-bold text-slate-700 mb-3">Password must contain:</p>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-slate-400" />
              <p className="text-sm text-slate-600">At least 8 characters</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-slate-400" />
              <p className="text-sm text-slate-600">One uppercase letter</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-slate-400" />
              <p className="text-sm text-slate-600">One number</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-slate-400" />
              <p className="text-sm text-slate-600">One special character</p>
            </div>
          </div>
          
          <Button
            className="w-full bg-teal-600 text-white py-5 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20"
            type="submit"
          >
            Reset Password
          </Button>
        </form>
        
        <div className="mt-10 pt-10 border-t border-slate-100 text-center">
          <p className="text-slate-500">
            Remember your password?{' '}
            <Link className="text-teal-600 font-bold hover:underline" href="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
