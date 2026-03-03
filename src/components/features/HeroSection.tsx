import Link from 'next/link'

export function HeroSection() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">
              Welcome to TINOS
            </h1>
            <p className="text-slate-600">
              Get started by signing up or logging in to your account
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Link href="/register" className="block">
              <button className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold">
                Sign Up
              </button>
            </Link>
            
            <Link href="/login" className="block">
              <button className="w-full px-6 py-3 bg-white text-teal-600 border-2 border-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-semibold">
                Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
