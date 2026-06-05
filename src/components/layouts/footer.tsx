'use client'

import { Link, Text, Image } from '@/components/ui'
import { Facebook, Twitter, Linkedin, PlusSquare } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#08333D] text-[#08333D] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[#466F78]/30 rounded flex items-center justify-center text-[#08333D]">
                <PlusSquare className="w-5 h-5" />
              </div>
              <Text variant="bold" className="text-xl font-serif font-bold">
                TINOS
              </Text>
            </div>
            <p className="text-slate-400 mb-6">
              Providing accessible, ethical, and high-quality healthcare through innovative technology.
            </p>
            <div className="flex gap-4">
              <Link 
                className="w-10 h-10 rounded-full bg-[#466F78]/30 flex items-center justify-center hover:bg-teal-600 transition-colors" 
                href="#"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link 
                className="w-10 h-10 rounded-full bg-[#466F78]/30 flex items-center justify-center hover:bg-teal-600 transition-colors" 
                href="#"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link 
                className="w-10 h-10 rounded-full bg-[#466F78]/30 flex items-center justify-center hover:bg-teal-600 transition-colors" 
                href="#"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          {/* Services Section */}
          {/* <div>
            <h4 className="text-lg font-bold mb-6">Services</h4>
            <ul className="space-y-4 text-slate-400">
              <li>
                <Link className="hover:text-[#466F78] transition-colors" href="/specialties">
                  Primary Care
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#466F78] transition-colors" href="/specialties">
                  Mental Health
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#466F78] transition-colors" href="/specialties">
                  Dermatology
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#466F78] transition-colors" href="/specialties">
                  Pediatrics
                </Link>
              </li>
            </ul>
          </div>
           */}
          {/* Support Section */}
          {/* <div>
            <h4 className="text-lg font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-slate-400">
              <li>
                <Link className="hover:text-[#466F78] transition-colors" href="/about">
                  About Us
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#466F78] transition-colors" href="/how-it-works">
                  How it Works
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#466F78] transition-colors" href="/faq">
                  FAQs
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#466F78] transition-colors" href="/contact">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div> */}
          
          {/* Legal Section */}
          {/* <div>
            <h4 className="text-lg font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-400">
              <li>
                <Link className="hover:text-[#466F78] transition-colors" href="/privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#466F78] transition-colors" href="/terms">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div> */}
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">
            © 2026 TINOS Telemedicine. All rights reserved.
          </p>
          {/* <div className="flex gap-8">
            <Image 
              className="h-8 grayscale opacity-50" 
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&q=80" 
              alt="HIPAA Certified" 
            />
            <Image 
              className="h-8 grayscale opacity-50" 
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&q=80" 
              alt="LegitScript Certified" 
            />
          </div> */}
        </div>
      </div>
    </footer>
  )
}
