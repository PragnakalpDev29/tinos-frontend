import { ShieldCheck, CheckCircle } from 'lucide-react'
import { Image, Link, Text } from '@/components/ui'

export function HeroSection() {
  return (
    <section id="hero" className="relative bg-teal-50 py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <ShieldCheck className="w-4 h-4" />
               HIPAA Compliant & Secure 
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif font-extrabold text-slate-900 mb-8 leading-tight">
               Healthcare that
                          meets you 
              <Text className="text-teal-600"> where you are. </Text>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
               Skip the waiting room. Connect with board-certified doctors in minutes from your phone or computer.
                          Quality care, ethically delivered. 
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link contentKey="cta_34" className="bg-teal-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 text-center" href="doctors.html"> Find a Doctor </Link>
              <Link contentKey="cta_35" className="bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-full font-bold text-lg hover:bg-slate-50 transition-all text-center" href="how-it-works.html"> How it Works </Link>
            </div>
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                <Image variant="cover" className="w-12 h-12 rounded-full border-4 border-white object-cover" src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80" alt="Doctor" />
                <Image variant="cover" className="w-12 h-12 rounded-full border-4 border-white object-cover" src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop" alt="Doctor" />
                <Image variant="cover" className="w-12 h-12 rounded-full border-4 border-white object-cover" src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop" alt="Doctor" />
              </div>
              <p className="text-slate-500 font-medium">
                <Text variant="bold" className="text-slate-900 font-bold"> 500+ </Text>
                 Specialists available now 
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl">
              <Image variant="cover" className="w-full h-[600px] object-cover" src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80" alt="Telemedicine Consultation" />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl max-w-xs hidden md:block">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><CheckCircle /></div>
                <h4 className="font-bold"> Instant Matching </h4>
              </div>
              <p className="text-slate-500 text-sm">
                 Our algorithm finds the best specialist for your specific needs in under 60 seconds. 
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-100/50 -skew-x-12 translate-x-1/2"></div>
    </section>
  )
}
