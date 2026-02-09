import { Image, Link, Text } from '@/components/ui'
import { ArrowRight, Baby, Brain, Check, Facebook, Heart, Linkedin, Menu, PlusSquare, Sparkles, Stethoscope, Twitter, Zap } from 'lucide-react'
import { MarketingLayout } from '@/components/layouts'

export const metadata = {
  title: 'TINOS - Free Tailwind Template',
  description:  'Download this free Tailwind CSS Healthcare website template for TINOS. Features a trust accessible design, fully responsive layout, and includes 13 pre-built pages like index.html, about.html, contact.html.',
};

export default function Page() {
  return (
    <MarketingLayout>
        
        <main className="pt-32 pb-24">
          {/* Our Medical Specialties */}
          <section id="our_medical_specialties">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6">
                   Our Medical 
                  <Text className="text-teal-600"> Specialties. </Text>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                   Comprehensive care across a wide range of medical fields, delivered by board-certified experts. 
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Primary Care */}
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Stethoscope /></div>
                  <h3 className="text-2xl font-bold mb-4"> Primary Care </h3>
                  <p className="text-slate-600 mb-8">
                     Routine check-ups, flu treatment, prescription refills, and general health advice for adults. 
                  </p>
                  <ul className="space-y-3 mb-8 text-slate-500 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Cold & Flu 
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Chronic Conditions 
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Wellness Exams 
                    </li>
                  </ul>
                  <Link variant="inline" className="inline-flex items-center gap-2 font-bold text-teal-600 hover:gap-4 transition-all" href="specialty-detail.html"> Learn More 
                  <ArrowRight className="w-5 h-5" /></Link>
                </div>
                {/* Mental Health */}
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group">
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-purple-600 group-hover:text-white transition-colors"><Brain /></div>
                  <h3 className="text-2xl font-bold mb-4"> Mental Health </h3>
                  <p className="text-slate-600 mb-8">
                     Compassionate therapy and psychiatry for anxiety, depression, stress, and more. 
                  </p>
                  <ul className="space-y-3 mb-8 text-slate-500 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Individual Therapy 
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Medication Management 
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Couples Counseling 
                    </li>
                  </ul>
                  <Link variant="inline" className="inline-flex items-center gap-2 font-bold text-teal-600 hover:gap-4 transition-all" href="specialty-detail.html"> Learn More 
                  <ArrowRight className="w-5 h-5" /></Link>
                </div>
                {/* Pediatrics */}
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-colors"><Baby /></div>
                  <h3 className="text-2xl font-bold mb-4"> Pediatrics </h3>
                  <p className="text-slate-600 mb-8">
                     Specialized care for children of all ages, from newborns to teenagers. 
                  </p>
                  <ul className="space-y-3 mb-8 text-slate-500 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Childhood Illnesses 
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Developmental Milestones 
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       School Physicals 
                    </li>
                  </ul>
                  <Link variant="inline" className="inline-flex items-center gap-2 font-bold text-teal-600 hover:gap-4 transition-all" href="specialty-detail.html"> Learn More 
                  <ArrowRight className="w-5 h-5" /></Link>
                </div>
                {/* Dermatology */}
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group">
                  <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-teal-600 group-hover:text-white transition-colors"><Sparkles /></div>
                  <h3 className="text-2xl font-bold mb-4"> Dermatology </h3>
                  <p className="text-slate-600 mb-8">
                     Expert diagnosis and treatment for skin, hair, and nail conditions via high-res video. 
                  </p>
                  <ul className="space-y-3 mb-8 text-slate-500 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Acne & Eczema 
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Rash Identification 
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Hair Loss Consultation 
                    </li>
                  </ul>
                  <Link variant="inline" className="inline-flex items-center gap-2 font-bold text-teal-600 hover:gap-4 transition-all" href="specialty-detail.html"> Learn More 
                  <ArrowRight className="w-5 h-5" /></Link>
                </div>
                {/* Women's Health */}
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group">
                  <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-pink-600 group-hover:text-white transition-colors"><Heart /></div>
                  <h3 className="text-2xl font-bold mb-4"> Women's Health </h3>
                  <p className="text-slate-600 mb-8">
                     Comprehensive reproductive and general health services tailored for women. 
                  </p>
                  <ul className="space-y-3 mb-8 text-slate-500 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Birth Control 
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Menopause Support 
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       UTI Treatment 
                    </li>
                  </ul>
                  <Link variant="inline" className="inline-flex items-center gap-2 font-bold text-teal-600 hover:gap-4 transition-all" href="specialty-detail.html"> Learn More 
                  <ArrowRight className="w-5 h-5" /></Link>
                </div>
                {/* Urgent Care */}
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-red-600 group-hover:text-white transition-colors"><Zap /></div>
                  <h3 className="text-2xl font-bold mb-4"> Urgent Care </h3>
                  <p className="text-slate-600 mb-8">
                     Immediate attention for non-emergency conditions that need quick resolution. 
                  </p>
                  <ul className="space-y-3 mb-8 text-slate-500 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Minor Injuries 
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Infections 
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-500" />
                       Allergic Reactions 
                    </li>
                  </ul>
                  <Link variant="inline" className="inline-flex items-center gap-2 font-bold text-teal-600 hover:gap-4 transition-all" href="specialty-detail.html"> Learn More 
                  <ArrowRight className="w-5 h-5" /></Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        
      </MarketingLayout>
  );
}
