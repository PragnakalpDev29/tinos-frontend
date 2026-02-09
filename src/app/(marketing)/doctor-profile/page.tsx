import { Button, Image, Link, Text } from '@/components/ui'
import { Award, CheckCircle, Clock, Facebook, GraduationCap, Linkedin, Menu, PlusSquare, Star, Twitter } from 'lucide-react'
import { MarketingLayout } from '@/components/layouts'

export const metadata = {
  title: 'TINOS - Free Tailwind Template',
  description:  'Download this free Tailwind CSS Healthcare website template for TINOS. Features a trust accessible design, fully responsive layout, and includes 13 pre-built pages like index.html, about.html, contact.html.',
};

export default function Page() {
  return (
    <MarketingLayout>
        
        <main className="pt-32 pb-24">
          {/* Dr Sarah Chen */}
          <section id="dr_sarah_chen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-16">
                {/* Left Column: Profile Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
                    <div className="w-full md:w-64 h-80 rounded-[3rem] overflow-hidden shadow-2xl flex-shrink-0">
                      <Image variant="cover" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80" alt="Dr. Sarah Chen" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <CheckCircle className="w-4 h-4" />
                         Verified Provider 
                      </div>
                      <h1 className="text-5xl font-serif font-bold mb-4"> Dr. Sarah Chen </h1>
                      <p className="text-2xl text-slate-600 mb-6"> Board-Certified Internal Medicine Specialist </p>
                      <div className="flex flex-wrap gap-8">
                        <div className="flex items-center gap-2">
                          <Star className="text-orange-400 fill-current" />
                          <Text variant="bold" className="font-bold"> 4.9 </Text>
                          <Text className="text-slate-400"> (1,240 Reviews) </Text>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="text-teal-600" />
                          <Text variant="bold" className="font-bold"> 15+ Years </Text>
                          <Text className="text-slate-400"> Experience </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-12">
                    {/* About Dr Chen */}
                    <section id="about_dr_chen">
                      <h2 className="text-3xl font-serif font-bold mb-6"> About Dr. Chen </h2>
                      <p className="text-lg text-slate-600 leading-relaxed">
                         Dr. Sarah Chen is a highly experienced internist with a passion for preventative medicine and patient education. She believes in a holistic approach to healthcare, focusing on lifestyle modifications alongside traditional medical treatments to achieve optimal health outcomes. 
                      </p>
                    </section>
                    {/* Education Training */}
                    <section id="education_training">
                      <h2 className="text-3xl font-serif font-bold mb-6"> Education & Training </h2>
                      <ul className="space-y-4">
                        <li className="flex gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0"><GraduationCap className="text-slate-400" /></div>
                          <div>
                            <h4 className="font-bold"> Johns Hopkins University </h4>
                            <p className="text-slate-500"> Doctor of Medicine (MD) </p>
                          </div>
                        </li>
                        <li className="flex gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0"><Award className="text-slate-400" /></div>
                          <div>
                            <h4 className="font-bold"> Mayo Clinic </h4>
                            <p className="text-slate-500"> Residency in Internal Medicine </p>
                          </div>
                        </li>
                      </ul>
                    </section>
                    {/* Patient Reviews */}
                    <section id="patient_reviews">
                      <h2 className="text-3xl font-serif font-bold mb-6"> Patient Reviews </h2>
                      <div className="space-y-8">
                        <div className="bg-slate-50 p-8 rounded-[2rem]">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-teal-200 rounded-full flex items-center justify-center font-bold text-teal-800 text-sm"> JD </div>
                              <h4 className="font-bold"> John D. </h4>
                            </div>
                            <div className="flex text-orange-400">
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                            </div>
                          </div>
                          <p className="text-slate-600">
                             "Dr. Chen was incredibly thorough and took the time to listen to all my concerns. I felt very comfortable during our video call." 
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
                {/* Right Column: Booking Sidebar */}
                <aside className="w-full lg:w-96">
                  <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-2xl sticky top-32">
                    <h3 className="text-2xl font-bold mb-8"> Book a Consultation </h3>
                    <div className="space-y-6 mb-10">
                      <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3"> Select Date </label>
                        <div className="grid grid-cols-3 gap-3">
                          <Button contentKey="cta_22" className="bg-teal-600 text-white py-4 rounded-2xl font-bold text-center"><Text className="block text-xs opacity-70"> Oct </Text>
                           27 </Button>
                          <Button contentKey="cta_23" className="bg-slate-50 text-slate-900 py-4 rounded-2xl font-bold text-center hover:bg-teal-50 transition-colors"><Text className="block text-xs text-slate-400"> Oct </Text>
                           28 </Button>
                          <Button contentKey="cta_24" className="bg-slate-50 text-slate-900 py-4 rounded-2xl font-bold text-center hover:bg-teal-50 transition-colors"><Text className="block text-xs text-slate-400"> Oct </Text>
                           29 </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3"> Select Time </label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button contentKey="cta_25" className="bg-slate-50 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-teal-50 transition-colors"> 2:00 PM </Button>
                          <Button contentKey="cta_26" className="bg-slate-50 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-teal-50 transition-colors"> 2:30 PM </Button>
                          <Button contentKey="cta_27" className="bg-slate-50 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-teal-50 transition-colors"> 3:00 PM </Button>
                          <Button contentKey="cta_28" className="bg-slate-50 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-teal-50 transition-colors"> 4:00 PM </Button>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-8 mb-8">
                      <div className="flex justify-between items-center mb-2">
                        <Text className="text-slate-500"> Consultation Fee </Text>
                        <Text variant="bold" className="font-bold"> $75.00 </Text>
                      </div>
                      <div className="flex justify-between items-center text-teal-600 font-bold">
                        <Text> Insurance Covered </Text>
                        <Text> -$60.00 </Text>
                      </div>
                      <div className="flex justify-between items-center mt-4 text-xl font-bold">
                        <Text> Total Due </Text>
                        <Text> $15.00 </Text>
                      </div>
                    </div>
                    <Button contentKey="cta_29" className="w-full bg-teal-600 text-white py-5 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20"> Confirm Booking </Button>
                    <p className="text-center text-slate-400 text-xs mt-6"> Secure payment via Stripe. HIPAA compliant. </p>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </main>
        
      </MarketingLayout>
  );
}
