import { MarketingLayout } from '@/components/layouts'
import { HeroSection } from '@/components/features'

export const metadata = {
  title: 'TINOS - Free Tailwind Template',
  description:  'Download this free Tailwind CSS Healthcare website template for TINOS. Features a trust accessible design, fully responsive layout, and includes 13 pre-built pages like index.html, about.html, contact.html.',
};

export default function Page() {
  return (
    <MarketingLayout>
      <main className="pt-20">
        <HeroSection />
      </main>
    </MarketingLayout>
  );
}
