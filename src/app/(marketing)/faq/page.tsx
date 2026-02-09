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
          {/* Common Questions */}
          <section id="common_questions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 text-center">
            <h1 className="text-6xl font-serif font-bold mb-8"> Common Questions </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
               Everything you need to know about using TINOS for your healthcare needs. 
            </p>
          </section>
          {/* General Information */}
          <section id="general_information" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
            <div className="space-y-12">
              {/* Category: General */}
              <div>
                <h2 className="text-3xl font-serif font-bold mb-8 border-b border-slate-100 pb-4"> General Information </h2>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold mb-3"> What is telemedicine? </h4>
                    <p className="text-slate-600 leading-relaxed">
                       Telemedicine allows you to receive medical care remotely via video calls, phone calls, or secure messaging. It's a convenient way to consult with doctors for non-emergency issues without leaving your home. 
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-3"> Is TINOS secure? </h4>
                    <p className="text-slate-600 leading-relaxed">
                       Yes. Our platform is fully HIPAA-compliant. We use end-to-end encryption for all video visits and messaging, ensuring your medical data remains private and secure. 
                    </p>
                  </div>
                </div>
              </div>
              {/* Category: Appointments */}
              <div>
                <h2 className="text-3xl font-serif font-bold mb-8 border-b border-slate-100 pb-4"> Appointments & Care </h2>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold mb-3"> Can I get a prescription? </h4>
                    <p className="text-slate-600 leading-relaxed">
                       Yes, our doctors can prescribe medications when medically necessary. Prescriptions are sent electronically to the pharmacy of your choice. Please note we do not prescribe controlled substances. 
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-3"> What conditions can you treat? </h4>
                    <p className="text-slate-600 leading-relaxed">
                       We treat a wide range of conditions including cold/flu, allergies, skin issues, mental health concerns, chronic disease management, and more. See our 
                      <Link className="text-teal-600 hover:underline" href="specialties.html"> Specialties </Link>
                       page for more details. 
                    </p>
                  </div>
                </div>
              </div>
              {/* Category: Billing */}
              <div>
                <h2 className="text-3xl font-serif font-bold mb-8 border-b border-slate-100 pb-4"> Billing & Insurance </h2>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold mb-3"> How much does a visit cost? </h4>
                    <p className="text-slate-600 leading-relaxed">
                       If you have insurance, you typically only pay your standard office visit copay ($0-$30). For self-pay patients, a standard consultation is $75. See our 
                      <Link className="text-teal-600 hover:underline" href="pricing.html"> Pricing </Link>
                       page for more info. 
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-3"> Do you accept my insurance? </h4>
                    <p className="text-slate-600 leading-relaxed">
                       We accept most major insurance plans. You can verify your coverage instantly during the registration process or by contacting our support team. 
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Still have questions? */}
          <section id="still_have_questions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center bg-teal-50 rounded-[4rem]">
            <h2 className="text-4xl font-serif font-bold mb-6"> Still have questions? </h2>
            <p className="text-xl text-slate-600 mb-10"> We're here to help you 24/7. </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link contentKey="cta_27" className="bg-teal-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20" href="contact.html"> Contact Support </Link>
              <Link contentKey="cta_28" className="bg-white text-teal-600 border-2 border-teal-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-teal-50 transition-all" href="tel:+18005550199"> Call Us Now </Link>
            </div>
          </section>
        </main>
        
      </MarketingLayout>
  );
}
