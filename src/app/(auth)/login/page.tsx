import { Header,  MobileMenu } from '@/components/layouts'
import { LoginForm } from '@/components/features/auth'

export default function LoginPage() {
  return (
    <div className="bg-white text-slate-900 font-sans antialiased">
      <Header />
      <MobileMenu />
      <main className="min-h-screen flex items-center justify-center px-4 py-24 bg-slate-50">
        <LoginForm />
      </main>
      {/* <Footer /> */}
    </div>
  )
}
