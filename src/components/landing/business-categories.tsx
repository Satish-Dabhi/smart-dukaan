"use client";

import { motion } from "framer-motion";

const categories = [
  { emoji: "🛒", name: "Grocery Store", description: "Kirana & supermarkets", count: "3.2K+" },
  { emoji: "☕", name: "Cafe & Coffee", description: "Cafes & tea stalls", count: "1.8K+" },
  { emoji: "🍕", name: "Restaurant", description: "Dhabas & restaurants", count: "2.1K+" },
  { emoji: "🥐", name: "Bakery", description: "Bakers & sweet shops", count: "980+" },
  { emoji: "💊", name: "Medical Store", description: "Pharmacies & clinics", count: "750+" },
  { emoji: "✂️", name: "Salon & Spa", description: "Beauty & wellness", count: "640+" },
  { emoji: "👗", name: "Fashion Retail", description: "Clothing & accessories", count: "1.1K+" },
  { emoji: "🔧", name: "Hardware Store", description: "Tools & supplies", count: "420+" },
];

export function BusinessCategories() {
  return (
    <section className="py-24 bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built for{" "}
            <span className="gradient-text">every business</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Join thousands of businesses across India already using SmartDukaan
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="text-4xl mb-3">{cat.emoji}</div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{cat.description}</p>
              <div className="inline-flex items-center bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                {cat.count} shops
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
