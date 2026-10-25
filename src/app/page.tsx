import type { Metadata } from "next";
import { BRAND } from "@/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { SolutionsSection } from "@/components/home/SolutionsSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { CustomSection } from "@/components/home/CustomSection";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: `${BRAND.name} — Seu negócio tem muito a explorar no digital`,
  description: BRAND.shortDescription,
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-nx-bg text-nx-text">
      <SiteHeader />
      <main>
        <Hero />
        <SolutionsSection />
        <ProcessSection />
        <CustomSection />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
