import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import {
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  HelpCircle,
  Zap,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Contact Us — SmartDukaan",
  description:
    "Get in touch with the SmartDukaan team. We're here to help with setup, billing questions, and any support you need.",
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us a detailed message and we'll get back to you within one business day.",
    value: "radhetech0911@gmail.com",
    href: "mailto:radhetech0911@gmail.com",
    cta: "Send an email",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp / Call",
    description: "Quick questions? Chat or call us on WhatsApp during business hours.",
    value: "+91 91061 16932",
    href: "https://wa.me/919106116932",
    cta: "Chat on WhatsApp",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
];

const faqs = [
  {
    question: "How do I get started with SmartDukaan?",
    answer:
      "Create a free account, set up your business profile, add your products, and you're ready to start billing. The entire setup takes under 5 minutes — no technical knowledge needed.",
  },
  {
    question: "Is SmartDukaan really free to use?",
    answer:
      "Yes. The free plan gives you access to core POS billing, product management, and basic analytics with no time limit. Paid plans unlock more products, staff accounts, and advanced features.",
  },
  {
    question: "Does SmartDukaan work without internet?",
    answer:
      "Yes. SmartDukaan is a Progressive Web App (PWA) that can be installed on any device. The POS billing continues to work offline and all data syncs automatically once your connection is restored.",
  },
  {
    question: "How does GST invoicing work?",
    answer:
      "You configure the GST percentage for each product (5%, 12%, 18%, or 28%). SmartDukaan automatically calculates the CGST and SGST split and generates a GST-compliant invoice with your GSTIN and sequential invoice number.",
  },
  {
    question: "Can my customers order online?",
    answer:
      "Yes. Every business gets a free public storefront URL (e.g. smartdukaan.com/store/your-shop). Customers can browse your catalog and place orders directly via WhatsApp with one tap.",
  },
  {
    question: "What is the QR menu system?",
    answer:
      "You can generate QR codes from your dashboard that link directly to your online storefront or a specific product. Print and place them at your counter or on tables so customers can browse and order instantly.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes. Each business's data is fully isolated from other businesses on the platform. Your products, customers, and invoices are never visible to anyone else. All connections use HTTPS and your session is protected by secure JWT tokens.",
  },
  {
    question: "Can I use SmartDukaan in Gujarati?",
    answer:
      "Yes. SmartDukaan supports both English and Gujarati. You can switch languages from your dashboard or storefront at any time, and invoices, menus, and product names all support Gujarati text.",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            We&apos;re here to help
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white mb-5 leading-tight">
            Get in{" "}
            <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              touch
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Whether you have a question about features, pricing, or need help setting up your
            business — we&apos;re here to make SmartDukaan work for you.
          </p>
        </div>
      </section>

      {/* Contact methods */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${method.bg} flex items-center justify-center mb-4`}
                >
                  <method.icon className={`w-6 h-6 ${method.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  {method.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  {method.description}
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                  {method.value}
                </p>
                <a
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r ${method.gradient} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}
                >
                  {method.cta}
                  <ExternalLink className="w-3.5 h-3.5 text-violet-500" />
                </a>
              </div>
            ))}
          </div>

          {/* Office info */}
          <div className="bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/30 rounded-2xl p-8 border border-violet-100 dark:border-violet-900/50 mb-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    Office Location
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Ahmedabad, Gujarat, India — 380001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    Support Hours
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Mon–Sat, 9:00 AM – 7:00 PM IST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    Email Response
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Within 1 business day
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently asked questions
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Quick answers</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Can&apos;t find your answer? Email us at{" "}
              <a
                href="mailto:radhetech0911@gmail.com"
                className="text-violet-600 hover:underline font-medium"
              >
                radhetech0911@gmail.com
              </a>
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-800 transition-colors overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none list-none">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <div className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
