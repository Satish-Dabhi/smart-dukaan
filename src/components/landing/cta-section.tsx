"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function CTASection() {
  const locale = useLocale();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 animated-gradient opacity-90" />
      <div className="absolute inset-0 bg-grid-white/[0.05]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
          Take your business digital today
        </h2>
        <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
          POS billing, GST invoicing, online storefront, inventory — everything your business needs
          in a single platform. Built for India, in India.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={`/${locale}/auth/register`}>
            <Button
              size="xl"
              className="bg-white text-violet-700 hover:bg-white/90 shadow-xl font-bold group"
            >
              Start for free — setup in minutes
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a
            href="#pricing"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl text-base font-semibold text-white border border-white/40 hover:bg-white/10 hover:border-white/70 transition-all duration-200"
          >
            View pricing
          </a>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-white/70 text-sm">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            No credit card required
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Free plan available forever
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            English + Gujarati supported
          </div>
        </div>
      </motion.div>
    </section>
  );
}
