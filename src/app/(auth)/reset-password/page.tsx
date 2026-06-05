import { Header, MobileMenu } from '@/components/layouts'
import { ResetPasswordForm } from '@/components/features/auth'

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08333D] text-slate-100 font-sans antialiased">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://cdn.prod.website-files.com/69bd2045b9175af5ee45abf7/69caa4a3910a52a83f931e61_tinos_bg_wide_softerright.jpg)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-slate-950/40" />
      <div className="relative z-10">
        <Header />
        <MobileMenu />
        <main className="min-h-screen flex items-center justify-center px-4 py-24">
          <ResetPasswordForm />
        </main>
      </div>
      {/* <Footer /> */}
    </div>
  )
}
