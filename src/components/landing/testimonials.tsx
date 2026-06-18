"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Globe,
  Package,
  BarChart3,
  MessageCircle,
  Users,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const painPoints = [
  {
    icon: FileText,
    problem: "GST billing is slow and error-prone",
    solution:
      "Generate GST-compliant invoices with auto-calculated CGST & SGST in seconds. PDF export and sequential numbering included.",
    gradient: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Globe,
    problem: "Your shop has no online presence",
    solution:
      "Get a beautiful public storefront instantly — share your link or QR code so customers can browse and order from anywhere.",
    gradient: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Package,
    problem: "Running out of stock unexpectedly",
    solution:
      "Real-time inventory tracking with low-stock alerts. Never miss a sale because you ran out of your best-selling product.",
    gradient: "from-pink-500 to-rose-600",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
  {
    icon: BarChart3,
    problem: "No idea what's selling or when",
    solution:
      "Visual analytics show your top products, peak hours, revenue trends, and category breakdowns — all in one dashboard.",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: MessageCircle,
    problem: "Customers can't place orders easily",
    solution:
      "Let customers browse your store and send their complete order via WhatsApp in one tap — zero friction ordering experience.",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Users,
    problem: "Losing customers to bigger competitors",
    solution:
      "Build loyalty with customer profiles, complete purchase history, and reward points that bring customers back again and again.",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-24 bg-gradient-to-br from-gray-50 to-violet-50/30 dark:from-gray-950 dark:to-violet-950/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <AlertTriangle className="w-3.5 h-3.5" />
            Common business challenges — solved
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Problems we <span className="gradient-text">eliminate</span> for you
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            SmartDukaan replaces spreadsheets, paper registers, and disconnected apps with one
            platform that handles your entire business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {painPoints.map((item, i) => {
            const fromLeft = i % 2 === 0;
            return (
              <motion.div
                key={item.problem}
                initial={{ opacity: 0, x: fromLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.07,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-violet-500/8 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300"
              >
                {/* Problem header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {item.problem}
                    </p>
                  </div>
                </div>

                {/* Solution */}
                <div className="px-6 py-5">
                  <div className="flex items-start gap-3">
                    <motion.div
                      className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                          SmartDukaan solves this
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.solution}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
