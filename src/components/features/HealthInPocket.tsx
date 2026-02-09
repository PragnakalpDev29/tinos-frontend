import { Apple, Play } from 'lucide-react'
import { Image, Link } from '@/components/ui'

export function HealthInPocket() {
  return (
    <section id="your_health_in_your_pocket" className="py-24 bg-teal-600 rounded-[4rem] mx-4 my-12 text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl lg:text-6xl font-serif font-bold mb-8"> Your health, in your pocket. </h2>
            <p className="text-xl text-teal-100 mb-12 leading-relaxed">
               Download the TINOS app to manage appointments, message your doctor, and access your health records
                          anytime, anywhere. 
            </p>
            <div className="flex flex-wrap gap-6">
              <Link contentKey="cta_40" className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-teal-50 transition-all" href="#"><Apple className="w-6 h-6" />
               App Store </Link>
              <Link contentKey="cta_41" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all" href="#"><Play className="w-6 h-6" />
               Google Play </Link>
            </div>
          </div>
          <div className="relative">
            <Image className="rounded-[3rem] shadow-2xl rotate-3" src="https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&q=80" alt="App Preview" />
            <div className="absolute -top-10 -right-0 bg-white p-6 rounded-3xl shadow-2xl text-slate-900 hidden md:block">
              <Image className="w-32 h-32 mb-4" src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&q=80" alt="QR Code" />
              <p className="text-center font-bold text-sm"> Scan to Download </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
    </section>
  )
}
