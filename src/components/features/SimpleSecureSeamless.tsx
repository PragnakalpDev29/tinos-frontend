import { Search, Video, Pill } from 'lucide-react'

export function SimpleSecureSeamless() {
  return (
    <section id="simple_secure_seamless" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6"> Simple, Secure, Seamless. </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
             Getting the care you need shouldn't be a headache. We've streamlined the process into three easy steps. 
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500 shadow-lg"><Search className="w-10 h-10" /></div>
            <h3 className="text-2xl font-bold mb-4"> 1. Find Your Specialist </h3>
            <p className="text-slate-600">
               Browse our network of board-certified doctors by specialty, language, or availability. 
            </p>
          </div>
          <div className="text-center group">
            <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500 shadow-lg"><Video className="w-10 h-10" /></div>
            <h3 className="text-2xl font-bold mb-4"> 2. Connect Instantly </h3>
            <p className="text-slate-600">
               Start a high-definition video consultation from any device. Secure and private. 
            </p>
          </div>
          <div className="text-center group">
            <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500 shadow-lg"><Pill className="w-10 h-10" /></div>
            <h3 className="text-2xl font-bold mb-4"> 3. Get Your Plan </h3>
            <p className="text-slate-600">
               Receive prescriptions, referrals, and follow-up care instructions immediately. 
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
