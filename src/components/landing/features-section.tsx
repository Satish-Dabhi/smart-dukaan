"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  ShoppingCart,
  BarChart3,
  Package,
  FileText,
  MessageCircle,
  QrCode,
  Globe,
  Smartphone,
  Bell,
  Shield,
  Zap,
  Users,
} from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "POS Billing",
    description:
      "Fast, intuitive point-of-sale with barcode scanning, GST calculation, and thermal printing support.",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    icon: Globe,
    title: "Online Storefront",
    description:
      "Beautiful, mobile-first online store for your business. Share your menu via QR code or direct link.",
    gradient: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Ordering",
    description:
      "Let customers order directly via WhatsApp with auto-generated order messages — zero friction.",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Deep insights into sales, revenue, top products, and customer behaviour with beautiful charts.",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    icon: Package,
    title: "Inventory Management",
    description:
      "Track stock levels, get low-stock alerts, manage restocks, and view full inventory history.",
    gradient: "from-pink-500 to-rose-600",
    bg: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    icon: FileText,
    title: "GST Invoicing",
    description:
      "Professional GST-compliant invoices with CGST/SGST breakdown, PDF export, and printing.",
    gradient: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    icon: QrCode,
    title: "QR Menu System",
    description: "Generate QR codes for table menus, storefront, or specific products instantly.",
    gradient: "from-teal-500 to-emerald-600",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    icon: Smartphone,
    title: "Mobile PWA",
    description: "Install as a native app on any device. Works offline for uninterrupted billing.",
    gradient: "from-purple-500 to-violet-600",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: Users,
    title: "Customer Management",
    description: "Build loyalty with customer profiles, purchase history, and reward points.",
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 dark:bg-rose-900/20",
  },
  {
    icon: Globe,
    title: "Multilingual",
    description: "Full support for English and Gujarati — invoices, menus, and product names.",
    gradient: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Real-time alerts for new orders, low stock, payment confirmations, and more.",
    gradient: "from-yellow-500 to-amber-600",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-grade security with RBAC, encrypted data, rate limiting, and CSRF protection.",
    gradient: "from-slate-600 to-gray-700",
    bg: "bg-slate-50 dark:bg-slate-900/20",
  },
];

/* ─── 3D tilt card ──────────────────────────────────────────────── */
function FeatureCard({ feature, index }: { feature: (typeof features)[number]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 300,
    damping: 30,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: index * 0.04,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-xl hover:shadow-violet-500/8 transition-[border-color,box-shadow] duration-300 cursor-default"
    >
      {/* Gradient shine on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-violet-500/[0.04] to-pink-500/[0.04] pointer-events-none" />

      <motion.div
        className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
        whileHover={{ scale: 1.15, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <div className={`bg-gradient-to-br ${feature.gradient} rounded-lg p-2`}>
          <feature.icon className="w-5 h-5 text-white" />
        </div>
      </motion.div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Everything you need
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful features for
            <br />
            <span className="gradient-text">every type of business</span>
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            From grocery stores to cafes, SmartDukaan has everything you need to run and grow your
            business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
