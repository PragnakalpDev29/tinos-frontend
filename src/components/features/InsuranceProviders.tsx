import { Image } from '@/components/ui'

export function InsuranceProviders() {
  return (
    <section id="insurance" className="py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-slate-400 font-bold uppercase tracking-widest text-sm mb-12">
           We accept most major
                      insurance providers 
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale">
          <Image className="h-8" src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&q=80" alt="Aetna" />
          <Image className="h-8" src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&q=80" alt="Cigna" />
          <Image className="h-8" src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&q=80" alt="UnitedHealthcare" />
          <Image className="h-8" src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&q=80" alt="BlueCross" />
          <Image className="h-8" src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&q=80" alt="Kaiser" />
        </div>
      </div>
    </section>
  )
}
