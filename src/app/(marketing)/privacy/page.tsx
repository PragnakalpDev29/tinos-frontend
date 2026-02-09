import { Image, Link, Text } from '@/components/ui'
import { Facebook, Linkedin, Menu, PlusSquare, Twitter } from 'lucide-react'
import { MarketingLayout } from '@/components/layouts'

export const metadata = {
  title: 'TINOS - Free Tailwind Template',
  description:  'Download this free Tailwind CSS Healthcare website template for TINOS. Features a trust accessible design, fully responsive layout, and includes 13 pre-built pages like index.html, about.html, contact.html.',
};

export default function Page() {
  return (
    <MarketingLayout>
        
        <main className="pt-32 pb-24">
          {/* Privacy Policy */}
          <section id="privacy_policy" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-serif font-bold mb-8"> Privacy Policy </h1>
            <p className="text-slate-500 mb-12 italic"> Last Updated: October 27, 2026 </p>
            <div className="prose prose-slate prose-lg max-w-none space-y-12 text-slate-600 leading-relaxed">
              {/* 1 Introduction */}
              <section id="1_introduction">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6"> 1. Introduction </h2>
                <p>
                   TINOS ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our telemedicine platform and services. We comply with the Health Insurance Portability and Accountability Act (HIPAA) and other applicable privacy laws. 
                </p>
              </section>
              {/* 2 Information We Collect */}
              <section id="2_information_we_collect">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6"> 2. Information We Collect </h2>
                <p>
                   We collect several types of information from and about users of our platform, including: 
                </p>
                <ul className="list-disc pl-6 space-y-4 mt-4">
                  <li>
                    <strong> Personal Identification: </strong>
                     Name, email address, phone number, and date of birth. 
                  </li>
                  <li>
                    <strong> Health Information: </strong>
                     Medical history, symptoms, diagnoses, and treatment plans (Protected Health Information or PHI). 
                  </li>
                  <li>
                    <strong> Insurance Information: </strong>
                     Provider name, policy number, and group ID. 
                  </li>
                  <li>
                    <strong> Payment Information: </strong>
                     Credit card details (processed securely via Stripe). 
                  </li>
                </ul>
              </section>
              {/* 3 How We Use Your Information */}
              <section id="3_how_we_use_your_information">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6"> 3. How We Use Your Information </h2>
                <p> We use the information we collect to: </p>
                <ul className="list-disc pl-6 space-y-4 mt-4">
                  <li> Provide and manage your medical consultations. </li>
                  <li> Process payments and insurance claims. </li>
                  <li> Communicate with you about your care and account. </li>
                  <li> Improve our platform and services. </li>
                  <li> Comply with legal and regulatory requirements. </li>
                </ul>
              </section>
              {/* 4 Data Security */}
              <section id="4_data_security">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6"> 4. Data Security </h2>
                <p>
                   We implement a variety of security measures to maintain the safety of your personal and health information. All sensitive data is transmitted via Secure Socket Layer (SSL) technology and encrypted in our database. Access to PHI is strictly limited to authorized medical personnel and support staff who need the information to provide care. 
                </p>
              </section>
              {/* 5 Your Rights */}
              <section id="5_your_rights">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6"> 5. Your Rights </h2>
                <p>
                   Under HIPAA and other privacy laws, you have the right to: 
                </p>
                <ul className="list-disc pl-6 space-y-4 mt-4">
                  <li> Access and receive a copy of your medical records. </li>
                  <li> Request corrections to inaccurate information. </li>
                  <li>
                     Request a restriction on how your information is used or shared. 
                  </li>
                  <li> Receive an accounting of disclosures of your PHI. </li>
                </ul>
              </section>
              {/* 6 Contact Us */}
              <section id="6_contact_us">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6"> 6. Contact Us </h2>
                <p>
                   If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact our Privacy Officer at 
                  <Link className="text-teal-600 font-bold" href="mailto:privacy@TINOS.com"> privacy@TINOS.com </Link>
                   . 
                </p>
              </section>
            </div>
          </section>
        </main>
        
      </MarketingLayout>
  );
}
