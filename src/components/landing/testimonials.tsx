"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Patel",
    business: "Fresh Mart Grocery",
    city: "Ahmedabad",
    emoji: "🛒",
    rating: 5,
    text: "SmartDukaan transformed my grocery store. The POS billing is so fast and the inventory alerts save me from running out of stock. Revenue up 40% in 3 months!",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "Priya Sharma",
    business: "Mocha Cafe",
    city: "Surat",
    emoji: "☕",
    rating: 5,
    text: "The WhatsApp ordering feature is amazing! Customers scan the QR code, select items, and order directly. My cafe is now getting 60+ WhatsApp orders daily.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    name: "Amit Desai",
    business: "City Medical Store",
    city: "Vadodara",
    emoji: "💊",
    rating: 5,
    text: "GST invoicing used to take hours. Now I generate perfect GST bills in seconds. The Gujarati language support is a big plus for my customers.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "Sonal Shah",
    business: "Taste of India Restaurant",
    city: "Rajkot",
    emoji: "🍕",
    rating: 5,
    text: "The table QR codes are brilliant! Customers scan, browse our full menu, and place orders. No more paper menus. Clean, modern, professional.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    name: "Mehul Joshi",
    business: "Fashionista Boutique",
    city: "Gandhinagar",
    emoji: "👗",
    rating: 5,
    text: "Analytics helped me understand which products sell best. I was able to optimize my inventory and increase profit margin by 25%. Highly recommend!",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    name: "Kavita Mehta",
    business: "Golden Bakery",
    city: "Bharuch",
    emoji: "🥐",
    rating: 5,
    text: "The mobile app works like a charm even without internet. I can bill customers offline and everything syncs automatically when connected. Perfect for my bakery!",
    gradient: "from-indigo-500 to-violet-600",
  },
];

export function Testimonials() {
  return (
    <section id="about" className="py-24 bg-gradient-to-br from-gray-50 to-violet-50/30 dark:from-gray-950 dark:to-violet-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Loved by{" "}
            <span className="gradient-text">business owners</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Real stories from real businesses across Gujarat and India
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-violet-100 dark:hover:border-violet-900 transition-all duration-300 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-violet-100 dark:text-violet-900/50" />

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-2xl`}
                >
                  {t.emoji}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">
                    {t.business} • {t.city}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                &quot;{t.text}&quot;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
