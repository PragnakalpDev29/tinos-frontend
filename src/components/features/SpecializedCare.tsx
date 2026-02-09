import { ArrowRight, Stethoscope, Brain, Baby, Sparkles } from 'lucide-react'
import { Link } from '@/components/ui'

export function SpecializedCare() {
  return (
    <section id="specialized_care_for_every_need" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6">
               Specialized Care for 
              <br />
               Every Need. 
            </h2>
            <p className="text-xl text-slate-600 max-w-xl">
               From routine check-ups to specialized mental health support, our experts are here for you. 
            </p>
          </div>
          <Link className="text-teal-600 font-bold flex items-center gap-2 hover:gap-4 transition-all" href="specialties.html"> View All Specialties 
          <ArrowRight /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link contentKey="cta_36" className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group" href="specialty-detail.html"><div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Stethoscope /></div>
          <h4 className="text-xl font-bold mb-2"> Primary Care </h4>
          <p className="text-slate-500 text-sm"> General health, flu, prescriptions, and wellness. </p></Link>
          <Link contentKey="cta_37" className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group" href="specialty-detail.html"><div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-purple-600 group-hover:text-white transition-colors"><Brain /></div>
          <h4 className="text-xl font-bold mb-2"> Mental Health </h4>
          <p className="text-slate-500 text-sm"> Therapy, psychiatry, and stress management. </p></Link>
          <Link contentKey="cta_38" className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group" href="specialty-detail.html"><div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-colors"><Baby /></div>
          <h4 className="text-xl font-bold mb-2"> Pediatrics </h4>
          <p className="text-slate-500 text-sm"> Specialized care for infants, children, and teens. </p></Link>
          <Link contentKey="cta_39" className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group" href="specialty-detail.html"><div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-teal-600 group-hover:text-white transition-colors"><Sparkles /></div>
          <h4 className="text-xl font-bold mb-2"> Dermatology </h4>
          <p className="text-slate-500 text-sm"> Skin, hair, and nail conditions treated remotely. </p></Link>
        </div>
      </div>
    </section>
  )
}
