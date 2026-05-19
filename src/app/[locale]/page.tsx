import { Suspense } from "react";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { BusinessCategories } from "@/components/landing/business-categories";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { PricingSection } from "@/components/landing/pricing-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <BusinessCategories />
      <HowItWorks />
      <Testimonials />
      <PricingSection />
      <CTASection />
      <Suspense>
        <Footer />
      </Suspense>
    </main>
  );
}
