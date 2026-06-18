"use client";

import { motion } from "framer-motion";

const categories = [
  {
    emoji: "🛒",
    name: "Grocery Store",
    description: "Kirana & supermarkets",
    theme: "Grocery theme",
  },
  { emoji: "☕", name: "Cafe & Coffee", description: "Cafes & tea stalls", theme: "Cafe theme" },
  {
    emoji: "🍕",
    name: "Restaurant",
    description: "Dhabas & restaurants",
    theme: "Restaurant theme",
  },
  { emoji: "🥐", name: "Bakery", description: "Bakers & sweet shops", theme: "Bakery theme" },
  {
    emoji: "💊",
    name: "Medical Store",
    description: "Pharmacies & clinics",
    theme: "Medical theme",
  },
  { emoji: "✂️", name: "Salon & Spa", description: "Beauty & wellness", theme: "Salon theme" },
  {
    emoji: "👗",
    name: "Fashion Retail",
    description: "Clothing & accessories",
    theme: "Retail theme",
  },
  { emoji: "🔧", name: "Hardware Store", description: "Tools & supplies", theme: "Minimal theme" },
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
          <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            8 tailored store themes included
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built for <span className="gradient-text">every business</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Each business type gets a dedicated storefront theme — so your online store looks and
            feels exactly right for your industry.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-[border-color,box-shadow] duration-300 cursor-pointer text-center"
            >
              <motion.div
                className="text-4xl mb-3"
                whileHover={{ scale: 1.2, rotate: [-5, 5, 0] }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {cat.emoji}
              </motion.div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{cat.description}</p>
              <div className="inline-flex items-center bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full text-xs font-medium">
                {cat.theme}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
