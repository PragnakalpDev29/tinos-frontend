import { Image, Link, Text } from '@/components/ui'
import { Facebook, Heart, Linkedin, Menu, PlusSquare, ShieldCheck, Twitter, Zap } from 'lucide-react'
import { MarketingLayout } from '@/components/layouts'

export const metadata = {
  title: 'TINOS - Free Tailwind Template',
  description:  'Download this free Tailwind CSS Healthcare website template for TINOS. Features a trust accessible design, fully responsive layout, and includes 13 pre-built pages like index.html, about.html, contact.html.',
};

export default function Page() {
  return (
    <MarketingLayout>
        
        <main className="pt-32 pb-24">
          {/* Bridging The Gap Between Patients And Providers */}
          <section id="bridging_the_gap_between_patients_and_providers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <h1 className="text-6xl font-serif font-bold mb-8 leading-tight"> Bridging the gap between patients and providers. </h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                   Founded in 2018, TINOS was born from a simple observation: the traditional healthcare system is often slow, expensive, and difficult to navigate. We set out to build a platform that puts the patient first. 
                </p>
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <div className="text-4xl font-serif font-bold text-teal-600 mb-2"> 500k+ </div>
                    <div className="text-slate-500 font-bold uppercase tracking-widest text-xs"> Visits Completed </div>
                  </div>
                  <div>
                    <div className="text-4xl font-serif font-bold text-teal-600 mb-2"> 1,200+ </div>
                    <div className="text-slate-500 font-bold uppercase tracking-widest text-xs"> Board-Certified Doctors </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-teal-100 blur-3xl rounded-full"></div>
                <Image className="relative rounded-[4rem] shadow-2xl" src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80" alt="Medical Team" />
              </div>
            </div>
          </section>
          {/* Our Core Values */}
          <section id="our_core_values" className="bg-slate-50 py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <h2 className="text-4xl font-serif font-bold mb-6"> Our Core Values </h2>
                <p className="text-slate-500 max-w-2xl mx-auto">
                   These principles guide every decision we make, from the doctors we hire to the features we build. 
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl">
                  <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-8"><Heart className="w-7 h-7" /></div>
                  <h3 className="text-2xl font-serif font-bold mb-4"> Empathy First </h3>
                  <p className="text-slate-600 leading-relaxed">
                     We treat every patient with the same care and respect we would want for our own families. 
                  </p>
                </div>
                <div className="bg-white p-12 rounded-[3rem] shadow-xl">
                  <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-8"><ShieldCheck className="w-7 h-7" /></div>
                  <h3 className="text-2xl font-serif font-bold mb-4"> Integrity & Trust </h3>
                  <p className="text-slate-600 leading-relaxed">
                     Medical ethics and data privacy are at the core of everything we do. No compromises. 
                  </p>
                </div>
                <div className="bg-white p-12 rounded-[3rem] shadow-xl">
                  <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-8"><Zap className="w-7 h-7" /></div>
                  <h3 className="text-2xl font-serif font-bold mb-4"> Radical Accessibility </h3>
                  <p className="text-slate-600 leading-relaxed">
                     We believe high-quality healthcare should be available to everyone, regardless of location or schedule. 
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* Our Leadership */}
          <section id="our_leadership" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
            <h2 className="text-4xl font-serif font-bold mb-16 text-center"> Our Leadership </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 shadow-xl">
                  <Image variant="cover" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80" alt="CEO" />
                </div>
                <h4 className="text-xl font-bold"> David Miller </h4>
                <p className="text-teal-600 font-medium"> CEO & Co-Founder </p>
              </div>
              <div className="text-center">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 shadow-xl">
                  <Image variant="cover" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80" alt="CMO" />
                </div>
                <h4 className="text-xl font-bold"> Dr. Elena Rodriguez </h4>
                <p className="text-teal-600 font-medium"> Chief Medical Officer </p>
              </div>
              <div className="text-center">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 shadow-xl">
                  <Image variant="cover" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80" alt="CTO" />
                </div>
                <h4 className="text-xl font-bold"> Marcus Thorne </h4>
                <p className="text-teal-600 font-medium"> Chief Technology Officer </p>
              </div>
              <div className="text-center">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 shadow-xl">
                  <Image variant="cover" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80" alt="COO" />
                </div>
                <h4 className="text-xl font-bold"> Sarah Jenkins </h4>
                <p className="text-teal-600 font-medium"> Chief Operating Officer </p>
              </div>
            </div>
          </section>
        </main>
        
      </MarketingLayout>
  );
}
