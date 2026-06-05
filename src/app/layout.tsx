import './globals.css'
import { AuthSessionProvider } from '@/components/providers/session-provider'
import { ToastProvider } from '@/components/providers/toast-provider'

export const metadata = {
 title: 'TINOS - Healthcare That Meets You Where You Are',
 description: 'Skip the waiting room. Connect with board-certified doctors in minutes from your phone or computer. Quality care, ethically delivered.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en">
 <body className="antialiased bg-[#08333D] text-[#08333D] ">
 <AuthSessionProvider>
 <ToastProvider />
 {children}
 </AuthSessionProvider>
 </body>
 </html>
 )
}
