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
               Trusted Cancer Care Platform 
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif font-extrabold text-slate-900 mb-8 leading-tight">
               Comprehensive Cancer Care
              <Text className="text-teal-600"> at Your Fingertips </Text>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
               Connect with expert oncologists and cancer specialists. Get personalized treatment plans, second opinions, and compassionate support throughout your cancer journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link contentKey="cta_34" className="bg-teal-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 text-center" href="#"> Find an Oncologist </Link>
              <Link contentKey="cta_35" className="bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-full font-bold text-lg hover:bg-slate-50 transition-all text-center" href="#"> Learn More </Link>
            </div>
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                <Image variant="cover" className="w-12 h-12 rounded-full border-4 border-white object-cover" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80" alt="Oncologist" />
                <Image variant="cover" className="w-12 h-12 rounded-full border-4 border-white object-cover" src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop" alt="Cancer Specialist" />
                <Image variant="cover" className="w-12 h-12 rounded-full border-4 border-white object-cover" src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop" alt="Medical Expert" />
              </div>
              <p className="text-slate-500 font-medium">
                <Text variant="bold" className="text-slate-900 font-bold"> 200+ </Text>
                 Oncology specialists available 
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl">
              <Image variant="cover" className="w-full h-[600px] object-cover" src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&q=80" alt="Cancer Care Consultation" />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl max-w-xs hidden md:block">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><CheckCircle /></div>
                <h4 className="font-bold"> Expert Matching </h4>
              </div>
              <p className="text-slate-500 text-sm">
                 Connect with oncologists specialized in your cancer type for personalized treatment plans. 
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-100/50 -skew-x-12 translate-x-1/2"></div>
    </section>
  )
}
