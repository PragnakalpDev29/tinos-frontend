import { Image, Link, Text } from '@/components/ui'
import { CalendarCheck, Facebook, FileText, Linkedin, Menu, Pill, PlusSquare, ShieldCheck, Twitter, UserPlus, Video } from 'lucide-react'
import { MarketingLayout } from '@/components/layouts'

export const metadata = {
  title: 'TINOS - Free Tailwind Template',
  description:  'Download this free Tailwind CSS Healthcare website template for TINOS. Features a trust accessible design, fully responsive layout, and includes 13 pre-built pages like index.html, about.html, contact.html.',
};

export default function Page() {
  return (
    <MarketingLayout>
        
        <main className="pt-32 pb-24">
          {/* Healthcare Simplified */}
          <section id="healthcare_simplified" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 text-center">
            <h1 className="text-6xl font-serif font-bold mb-8"> Healthcare, Simplified. </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
               We've redesigned the medical experience from the ground up. No waiting rooms, no travel time, just expert care when you need it. 
            </p>
          </section>
          {/* Create Your Profile */}
          <section id="create_your_profile" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="relative">
                <div className="text-[12rem] font-serif font-bold text-teal-50 absolute -top-24 -left-8 -z-10"> 1 </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative z-10">
                  <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-teal-600/20"><UserPlus className="w-8 h-8" /></div>
                  <h3 className="text-2xl font-serif font-bold mb-4"> Create Your Profile </h3>
                  <p className="text-slate-600 leading-relaxed">
                     Sign up in minutes. Securely add your medical history and insurance information to our HIPAA-compliant platform. 
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="text-[12rem] font-serif font-bold text-teal-50 absolute -top-24 -left-8 -z-10"> 2 </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative z-10">
                  <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-teal-600/20"><CalendarCheck className="w-8 h-8" /></div>
                  <h3 className="text-2xl font-serif font-bold mb-4"> Book a Specialist </h3>
                  <p className="text-slate-600 leading-relaxed">
                     Browse our network of board-certified doctors. Choose a time that works for you—often with same-day availability. 
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="text-[12rem] font-serif font-bold text-teal-50 absolute -top-24 -left-8 -z-10"> 3 </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative z-10">
                  <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-teal-600/20"><Video className="w-8 h-8" /></div>
                  <h3 className="text-2xl font-serif font-bold mb-4"> Start Your Visit </h3>
                  <p className="text-slate-600 leading-relaxed">
                     Connect via high-definition video. Get a diagnosis, treatment plan, and prescriptions sent to your local pharmacy. 
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* Why Choose Virtual Care With TINOS */}
          <section id="why_choose_virtual_care_with_TINOS" className="bg-slate-900 py-32 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div>
                  <h2 className="text-5xl font-serif font-bold mb-12 leading-tight"> Why choose virtual care with TINOS? </h2>
                  <div className="space-y-10">
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><ShieldCheck className="text-teal-400" /></div>
                      <div>
                        <h4 className="text-xl font-bold mb-2"> Bank-Level Security </h4>
                        <p className="text-slate-400">
                           Your data is encrypted and stored according to the highest medical privacy standards. 
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><Pill className="text-teal-400" /></div>
                      <div>
                        <h4 className="text-xl font-bold mb-2"> Prescription Management </h4>
                        <p className="text-slate-400">
                           We coordinate directly with your pharmacy for seamless medication pickup or delivery. 
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><FileText className="text-teal-400" /></div>
                      <div>
                        <h4 className="text-xl font-bold mb-2"> Integrated Lab Results </h4>
                        <p className="text-slate-400">
                           View your lab results and doctor's notes directly in your patient dashboard. 
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-4 bg-teal-500/20 blur-3xl rounded-full"></div>
                  <Image className="relative rounded-[3rem] shadow-2xl border border-white/10" src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80" alt="Telemedicine Interface" />
                </div>
              </div>
            </div>
          </section>
          {/* Ready To Experience The Future Of Healthcare */}
          <section id="ready_to_experience_the_future_of_healthcare" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
            <div className="bg-teal-50 rounded-[4rem] p-20">
              <h2 className="text-5xl font-serif font-bold mb-8"> Ready to experience the future of healthcare? </h2>
              <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
                 Join over 50,000 patients who trust TINOS for their primary and specialized medical needs. 
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link contentKey="cta_25" className="bg-teal-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20" href="doctors.html"> Find a Doctor </Link>
                <Link contentKey="cta_26" className="bg-white text-teal-600 border-2 border-teal-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-teal-50 transition-all" href="pricing.html"> View Pricing </Link>
              </div>
            </div>
          </section>
        </main>
        
      </MarketingLayout>
  );
}
