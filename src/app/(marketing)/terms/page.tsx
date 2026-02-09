import { Image, Link, Text } from '@/components/ui'
import { Facebook, Linkedin, Menu, PlusSquare, Twitter } from 'lucide-react'
import { MarketingLayout } from '@/components/layouts'

export const metadata = {
  title: 'TINOS - Free Tailwind Template',
  description:  'Download this free Tailwind CSS Healthcare website template for TINOS. Features a trust accessible design, fully responsive layout, and includes 13 pre-built pages like index.html, about.html, contact.html.',
};

export default function Page() {
  return (
    <MarketingLayout>
        
        <main className="pt-32 pb-24">
          {/* Terms Of Service */}
          <section id="terms_of_service" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-serif font-bold mb-8"> Terms of Service </h1>
            <p className="text-slate-500 mb-12 italic"> Last Updated: October 27, 2026 </p>
            <div className="prose prose-slate prose-lg max-w-none space-y-12 text-slate-600 leading-relaxed">
              {/* 1 Acceptance Of Terms */}
              <section id="1_acceptance_of_terms">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6"> 1. Acceptance of Terms </h2>
                <p>
                   By accessing or using the TINOS platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. 
                </p>
              </section>
              {/* 2 Not For Emergencies */}
              <section id="2_not_for_emergencies" className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
                <h2 className="text-2xl font-serif font-bold text-orange-900 mb-4"> 2. NOT FOR EMERGENCIES </h2>
                <p className="text-orange-800 font-medium">
                   TINOS IS NOT FOR MEDICAL EMERGENCIES. IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY, CALL 911 OR YOUR LOCAL EMERGENCY SERVICES IMMEDIATELY. DO NOT RELY ON TINOS FOR URGENT, LIFE-THREATENING CONDITIONS. 
                </p>
              </section>
              {/* 3 Medical Services */}
              <section id="3_medical_services">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6"> 3. Medical Services </h2>
                <p>
                   TINOS provides a platform for connecting patients with independent healthcare providers. While we vet all providers for credentials and licensing, the medical advice and treatment you receive are the sole responsibility of the provider. TINOS does not practice medicine. 
                </p>
              </section>
              {/* 4 User Responsibilities */}
              <section id="4_user_responsibilities">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6"> 4. User Responsibilities </h2>
                <p> You agree to: </p>
                <ul className="list-disc pl-6 space-y-4 mt-4">
                  <li> Provide accurate and complete medical history. </li>
                  <li> Maintain the confidentiality of your account credentials. </li>
                  <li> Use the platform only for lawful purposes. </li>
                  <li> Be at least 18 years of age or have parental consent. </li>
                </ul>
              </section>
              {/* 5 Payments Cancellations */}
              <section id="5_payments_cancellations">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6"> 5. Payments & Cancellations </h2>
                <p>
                   Payments are due at the time of service unless covered by insurance. Cancellations made less than 24 hours before a scheduled appointment may be subject to a cancellation fee. Refunds are handled on a case-by-case basis. 
                </p>
              </section>
              {/* 6 Limitation Of Liability */}
              <section id="6_limitation_of_liability">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6"> 6. Limitation of Liability </h2>
                <p>
                   In no event shall TINOS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TINOS's platform. 
                </p>
              </section>
              {/* 7 Governing Law */}
              <section id="7_governing_law">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6"> 7. Governing Law </h2>
                <p>
                   These terms and conditions are governed by and construed in accordance with the laws of the State of California and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location. 
                </p>
              </section>
            </div>
          </section>
        </main>
        
      </MarketingLayout>
  );
}
