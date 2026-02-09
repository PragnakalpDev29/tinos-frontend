import { Badge, Button, Image, Link, Text } from '@/components/ui'
import { Facebook, Linkedin, Menu, PlusSquare, Search, Star, Twitter } from 'lucide-react'
import { MarketingLayout } from '@/components/layouts'

export const metadata = {
  title: 'TINOS - Free Tailwind Template',
  description:  'Download this free Tailwind CSS Healthcare website template for TINOS. Features a trust accessible design, fully responsive layout, and includes 13 pre-built pages like index.html, about.html, contact.html.',
};

export default function Page() {
  return (
    <MarketingLayout>
        
        <main className="pt-32 pb-24">
          {/* Meet Our Experts */}
          <section id="meet_our_experts">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
                <div>
                  <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6">
                     Meet Our 
                    <Text className="text-teal-600"> Experts. </Text>
                  </h1>
                  <p className="text-xl text-slate-600 max-w-xl">
                     Board-certified specialists dedicated to providing ethical, high-quality care. 
                  </p>
                </div>
                <div className="w-full lg:w-96">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input placeholder="Search by name or specialty..." type="text" className="w-full bg-slate-50 border border-slate-200 rounded-full py-5 pl-16 pr-8 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Doctor 1 */}
                <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all group">
                  <div className="relative h-80 overflow-hidden">
                    <Image variant="cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80" alt="Dr. Sarah Chen" />
                    <Badge className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-teal-600 shadow-lg"> Available Now </Badge>
                  </div>
                  <div className="p-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1"> Dr. Sarah Chen </h3>
                        <p className="text-teal-600 font-bold text-sm uppercase tracking-widest"> Primary Care </p>
                      </div>
                      <div className="flex items-center gap-1 text-orange-400">
                        <Star className="w-4 h-4 fill-current" />
                        <Text variant="bold" className="text-slate-900 font-bold"> 4.9 </Text>
                      </div>
                    </div>
                    <p className="text-slate-500 mb-8">
                       15+ years experience in internal medicine and preventative care. 
                    </p>
                    <div className="flex items-center justify-between">
                      <Text className="text-slate-400 text-sm font-medium"> Next: Today, 2:00 PM </Text>
                      <Link contentKey="cta_16" className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-700 transition-all" href="doctor-profile.html"> Book </Link>
                    </div>
                  </div>
                </div>
                {/* Doctor 2 */}
                <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all group">
                  <div className="relative h-80 overflow-hidden">
                    <Image variant="cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80" alt="Dr. James Wilson" />
                  </div>
                  <div className="p-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1"> Dr. James Wilson </h3>
                        <p className="text-teal-600 font-bold text-sm uppercase tracking-widest"> Psychiatry </p>
                      </div>
                      <div className="flex items-center gap-1 text-orange-400">
                        <Star className="w-4 h-4 fill-current" />
                        <Text variant="bold" className="text-slate-900 font-bold"> 4.8 </Text>
                      </div>
                    </div>
                    <p className="text-slate-500 mb-8">
                       Specializing in anxiety disorders and cognitive behavioral therapy. 
                    </p>
                    <div className="flex items-center justify-between">
                      <Text className="text-slate-400 text-sm font-medium"> Next: Tomorrow, 9:00 AM </Text>
                      <Link contentKey="cta_17" className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-700 transition-all" href="doctor-profile.html"> Book </Link>
                    </div>
                  </div>
                </div>
                {/* Doctor 3 */}
                <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all group">
                  <div className="relative h-80 overflow-hidden">
                    <Image variant="cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80" alt="Dr. Elena Rodriguez" />
                    <Badge className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-teal-600 shadow-lg"> Available Now </Badge>
                  </div>
                  <div className="p-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1"> Dr. Elena Rodriguez </h3>
                        <p className="text-teal-600 font-bold text-sm uppercase tracking-widest"> Pediatrics </p>
                      </div>
                      <div className="flex items-center gap-1 text-orange-400">
                        <Star className="w-4 h-4 fill-current" />
                        <Text variant="bold" className="text-slate-900 font-bold"> 5.0 </Text>
                      </div>
                    </div>
                    <p className="text-slate-500 mb-8">
                       Dedicated to providing compassionate care for children and adolescents. 
                    </p>
                    <div className="flex items-center justify-between">
                      <Text className="text-slate-400 text-sm font-medium"> Next: Today, 4:30 PM </Text>
                      <Link contentKey="cta_18" className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-700 transition-all" href="doctor-profile.html"> Book </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-16 flex justify-center">
                <Button contentKey="cta_19" className="bg-slate-50 text-slate-900 px-12 py-6 rounded-full font-bold hover:bg-slate-100 transition-all border border-slate-200"> Load More Doctors </Button>
              </div>
            </div>
          </section>
        </main>
        
      </MarketingLayout>
  );
}
