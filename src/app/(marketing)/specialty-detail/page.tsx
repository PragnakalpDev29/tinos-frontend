import { Image, Link, Text } from '@/components/ui'
import { Calendar, ChevronRight, Facebook, Linkedin, Lock, Menu, PlusSquare, Twitter, Users } from 'lucide-react'
import { MarketingLayout } from '@/components/layouts'

export const metadata = {
  title: 'TINOS - Free Tailwind Template',
  description:  'Download this free Tailwind CSS Healthcare website template for TINOS. Features a trust accessible design, fully responsive layout, and includes 13 pre-built pages like index.html, about.html, contact.html.',
};

export default function Page() {
  return (
    <MarketingLayout>
        
        <main className="pt-32 pb-24">
          {/* Compassionate Mental Health Support */}
          <section id="compassionate_mental_health_support">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                <div>
                  <nav className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest mb-8">
                    <Link className="hover:text-teal-600 transition-colors" href="specialties.html"> Specialties </Link>
                    <ChevronRight className="w-4 h-4" />
                    <Text className="text-slate-900"> Mental Health </Text>
                  </nav>
                  <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-8 leading-tight">
                     Compassionate 
                    <Text className="text-teal-600"> Mental Health </Text>
                     Support. 
                  </h1>
                  <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                     Your mental well-being is just as important as your physical health. Our board-certified therapists and psychiatrists provide secure, private care from the comfort of your home. 
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link contentKey="cta_23" className="bg-teal-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20" href="doctors.html"> Find a Therapist </Link>
                    <Link contentKey="cta_24" className="bg-slate-50 text-slate-900 px-10 py-5 rounded-full font-bold text-lg hover:bg-slate-100 transition-all" href="pricing.html"> View Pricing </Link>
                  </div>
                </div>
                <div className="relative">
                  <div className="rounded-[3rem] overflow-hidden shadow-2xl">
                    <Image variant="cover" className="w-full h-[500px] object-cover" src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80q=80" alt="Mental Health Support" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
                <div className="bg-teal-50 p-10 rounded-[3rem]">
                  <h3 className="text-2xl font-bold mb-4"> Anxiety & Stress </h3>
                  <p className="text-slate-600">
                     Evidence-based strategies to manage daily stressors and chronic anxiety disorders. 
                  </p>
                </div>
                <div className="bg-teal-50 p-10 rounded-[3rem]">
                  <h3 className="text-2xl font-bold mb-4"> Depression </h3>
                  <p className="text-slate-600">
                     Personalized treatment plans including therapy and medication management if needed. 
                  </p>
                </div>
                <div className="bg-teal-50 p-10 rounded-[3rem]">
                  <h3 className="text-2xl font-bold mb-4"> Relationship Care </h3>
                  <p className="text-slate-600">
                     Couples and family therapy to improve communication and resolve conflicts. 
                  </p>
                </div>
              </div>
              <div className="bg-slate-900 text-white rounded-[4rem] p-12 lg:p-20">
                <div className="max-w-3xl">
                  <h2 className="text-4xl font-serif font-bold mb-8"> Why choose TINOS for Mental Health? </h2>
                  <div className="space-y-8">
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0"><Lock /></div>
                      <div>
                        <h4 className="text-xl font-bold mb-2"> 100% Private & Secure </h4>
                        <p className="text-slate-400">
                           Our platform uses bank-grade encryption to ensure your sessions remain completely confidential. 
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0"><Users /></div>
                      <div>
                        <h4 className="text-xl font-bold mb-2"> Expert Specialists </h4>
                        <p className="text-slate-400">
                           All our providers are licensed, board-certified, and undergo rigorous background checks. 
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0"><Calendar /></div>
                      <div>
                        <h4 className="text-xl font-bold mb-2"> Flexible Scheduling </h4>
                        <p className="text-slate-400">
                           Book appointments that fit your life, including evenings and weekends. 
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
      </MarketingLayout>
  );
}
