import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import {
  ShoppingBag,
  Users,
  BarChart3,
  Shield,
  Globe,
  Heart,
  Zap,
  Package,
  FileText,
  MessageCircle,
} from "lucide-react";

export const metadata = {
  title: "About Us — SmartDukaan",
  description:
    "Learn about SmartDukaan — the all-in-one POS, storefront and analytics platform built for Indian local businesses.",
};

const stats = [
  { value: "10,000+", label: "Businesses onboarded" },
  { value: "8", label: "Business themes" },
  { value: "₹50Cr+", label: "Revenue processed" },
  { value: "2", label: "Languages supported" },
];

const features = [
  {
    icon: ShoppingBag,
    title: "POS Billing",
    description:
      "High-speed point-of-sale with barcode scanning, GST calculation (CGST + SGST), and thermal print invoice generation.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Globe,
    title: "Dynamic Storefronts",
    description:
      "Every business gets a public-facing e-commerce storefront with 8 customizable themes — Grocery, Cafe, Bakery, Restaurant, Medical, Salon, Retail, and Minimal.",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: FileText,
    title: "GST Invoicing",
    description:
      "Indian GST-compliant invoices with automatic CGST and SGST split. PDF export, email delivery, and sequential invoice numbering.",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Ordering",
    description:
      "Customers browse the storefront, build a cart, and send their order directly via WhatsApp. Zero friction for your customers.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Package,
    title: "Inventory Management",
    description:
      "Real-time stock monitoring, low-stock alerts, restock logs, and full inventory history — so you never run out of your best sellers.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Revenue trends, top products, peak business hours, and category breakdowns — all visualized with beautiful charts.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Users,
    title: "Customer Loyalty",
    description:
      "Automatic tracking of customer purchase history, total spend, and loyalty reward points to keep customers coming back.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Multi-tenant data isolation at the database layer, RBAC roles, encrypted JWT sessions, and rate limiting on all APIs.",
    gradient: "from-slate-600 to-gray-700",
  },
];

const businessTypes = [
  { emoji: "🛒", name: "Grocery / Kirana" },
  { emoji: "☕", name: "Cafe & Tea Stalls" },
  { emoji: "🍕", name: "Restaurants & Dhabas" },
  { emoji: "🥐", name: "Bakeries & Sweet Shops" },
  { emoji: "💊", name: "Medical & Pharmacy" },
  { emoji: "✂️", name: "Salons & Spas" },
  { emoji: "👗", name: "Fashion Retail" },
  { emoji: "🔧", name: "Hardware Stores" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Heart className="w-3.5 h-3.5 fill-current" />
            Made with love in India
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            Digitizing India&apos;s{" "}
            <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              local businesses
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            SmartDukaan is a production-ready, multi-tenant SaaS platform designed for Indian local
            businesses to digitize their operations — from point-of-sale billing and online
            storefronts to GST invoicing and customer loyalty.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/30 rounded-3xl p-10 border border-violet-100 dark:border-violet-900/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
              India has millions of local businesses — kirana stores, cafes, medical shops, salons —
              that run on paper registers and WhatsApp messages. SmartDukaan exists to give every
              one of them the same digital toolkit that enterprise chains take for granted: fast
              billing, automated GST compliance, an online presence, and real data to grow smarter.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed mt-4">
              We support English and Gujarati out of the box — because software should work in the
              language your customers speak.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything your business needs
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              A complete platform — not a collection of disconnected tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4`}
                >
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business types */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built for every type of business
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-12">
            SmartDukaan ships with 8 tailored themes so your storefront fits your industry.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {businessTypes.map((b) => (
              <div
                key={b.name}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-2">{b.emoji}</div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {b.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built on modern tech
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-10">
            SmartDukaan is engineered for reliability, speed, and security.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Next.js 16 App Router",
              "MongoDB + Mongoose",
              "Auth.js v5",
              "Tailwind CSS v4",
              "Shadcn UI",
              "TanStack Query",
              "Recharts",
              "next-intl",
              "Cloudinary",
              "Resend",
              "Upstash Redis",
              "React Hook Form + Zod",
            ].map((tech) => (
              <span
                key={tech}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
