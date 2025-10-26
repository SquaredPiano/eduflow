import { Navbar } from '@/components/homepage/navbar';
import { Hero } from '@/components/homepage/hero';
import { Content } from '@/components/homepage/content';
import { Footer } from '@/components/homepage/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Content />
      </main>
      <Footer />
    </div>
  );
}
