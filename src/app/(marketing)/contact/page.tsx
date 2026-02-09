import { Button, Image, Input, Link, Text } from '@/components/ui'
import { AlertCircle, Facebook, Linkedin, Mail, MapPin, Menu, Phone, PlusSquare, Twitter } from 'lucide-react'
import { MarketingLayout } from '@/components/layouts'

export const metadata = {
  title: 'TINOS - Free Tailwind Template',
  description:  'Download this free Tailwind CSS Healthcare website template for TINOS. Features a trust accessible design, fully responsive layout, and includes 13 pre-built pages like index.html, about.html, contact.html.',
};

export default function Page() {
  return (
    <MarketingLayout>
        
        <main className="pt-32 pb-24">
          {/* Get In Touch */}
          <section id="get_in_touch">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                {/* Contact Info */}
                <div>
                  <h1 className="text-6xl font-serif font-bold mb-8"> Get in Touch </h1>
                  <p className="text-xl text-slate-600 mb-12 leading-relaxed">
                     Have questions about our services or need help with your account? Our support team is available 24/7 to assist you. 
                  </p>
                  <div className="space-y-10">
                    <div className="flex gap-6">
                      <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 flex-shrink-0"><Mail className="w-7 h-7" /></div>
                      <div>
                        <h4 className="text-xl font-bold mb-1"> Email Us </h4>
                        <p className="text-slate-500 mb-2"> For general inquiries and support. </p>
                        <Link className="text-teal-600 font-bold hover:underline" href="mailto:support@TINOS.com"> support@TINOS.com </Link>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 flex-shrink-0"><Phone className="w-7 h-7" /></div>
                      <div>
                        <h4 className="text-xl font-bold mb-1"> Call Us </h4>
                        <p className="text-slate-500 mb-2"> Available Mon-Fri, 9am-6pm EST. </p>
                        <Link className="text-teal-600 font-bold hover:underline" href="tel:+18005550199"> +1 (800) 555-0199 </Link>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 flex-shrink-0"><MapPin className="w-7 h-7" /></div>
                      <div>
                        <h4 className="text-xl font-bold mb-1"> Headquarters </h4>
                        <p className="text-slate-500">
                           123 Medical Plaza, Suite 500 
                          <br />
                           San Francisco, CA 94103 
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-16 p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <AlertCircle className="text-orange-500" />
                       Emergency Notice 
                    </h4>
                    <p className="text-sm text-slate-600">
                       If you are experiencing a medical emergency, please call 911 or go to the nearest emergency room immediately. TINOS is not for emergency medical care. 
                    </p>
                  </div>
                </div>
                {/* Contact Form */}
                <div className="bg-white border border-slate-100 rounded-[4rem] p-12 shadow-2xl">
                  <form className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3"> First Name </label>
                        <Input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all" type="text" placeholder="John" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3"> Last Name </label>
                        <Input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all" type="text" placeholder="Doe" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3"> Email Address </label>
                      <Input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all" type="email" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3"> Subject </label>
                      <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all appearance-none">
                        <option> General Inquiry </option>
                        <option> Billing Question </option>
                        <option> Technical Support </option>
                        <option> Insurance Verification </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3"> Message </label>
                      <textarea placeholder="How can we help you?" rows={5} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 transition-all"></textarea>
                    </div>
                    <Button contentKey="cta_18" className="w-full bg-teal-600 text-white py-5 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20" type="submit"> Send Message </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>
        
      </MarketingLayout>
  );
}
