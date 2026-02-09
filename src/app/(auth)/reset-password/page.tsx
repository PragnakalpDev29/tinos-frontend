import { Header, Footer, MobileMenu } from '@/components/layouts'
import { ResetPasswordForm } from '@/components/features/auth'

export default function ResetPasswordPage() {
  return (
    <div className="bg-white text-slate-900 font-sans antialiased">
      <Header />
      <MobileMenu />
      <main className="min-h-screen flex items-center justify-center px-4 py-24 bg-slate-50">
        <ResetPasswordForm />
      </main>
      <Footer />
    </div>
  )
}
