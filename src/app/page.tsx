import type { Metadata } from "next";
import { BRAND } from "@/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { SolutionsSection } from "@/components/home/SolutionsSection";
import { LiveGestaoWidget } from "@/components/home/LiveGestaoWidget";
import { ProcessSection } from "@/components/home/ProcessSection";
import { CustomSection } from "@/components/home/CustomSection";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: `${BRAND.name} — Seu negócio tem muito a explorar no digital`,
  description: BRAND.shortDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${BRAND.name} — Seu negócio tem muito a explorar no digital`,
    description: BRAND.shortDescription,
    url: "/",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-nx-bg text-nx-text">
      <SiteHeader />
      <main>
        <Hero />
        <SolutionsSection />
        <section className="relative pb-24 sm:pb-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <LiveGestaoWidget />
          </div>
        </section>
        <ProcessSection />
        <CustomSection />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
