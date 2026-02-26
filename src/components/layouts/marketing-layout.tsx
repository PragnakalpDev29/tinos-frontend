'use client'

import { Header } from './header'
// import { Footer } from './footer'
import { MobileMenu } from './mobile-menu'

interface MarketingLayoutProps {
  children: React.ReactNode
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="bg-white text-slate-900 font-sans antialiased">
      <Header />
      <MobileMenu />
      {children}
      {/* <Footer /> */}
    </div>
  )
}
