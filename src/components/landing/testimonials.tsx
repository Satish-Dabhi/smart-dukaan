"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

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

const VISIBLE = 3;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((i) => mod(i + 1, testimonials.length));
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((i) => mod(i - 1, testimonials.length));
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(goNext, 4500);
    return () => clearInterval(timer);
  }, [paused, goNext]);

  // Indices of the 3 visible cards
  const visibleIndices = Array.from({ length: VISIBLE }, (_, i) =>
    mod(activeIndex + i, testimonials.length)
  );

  return (
    <section
      id="testimonials"
      className="py-24 bg-gradient-to-br from-gray-50 to-violet-50/30 dark:from-gray-950 dark:to-violet-950/20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Loved by <span className="gradient-text">business owners</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Real stories from real businesses across Gujarat and India
          </p>
        </motion.div>

        {/* Desktop carousel — 3 visible */}
        <div className="hidden md:block relative">
          <div className="overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ x: d * 80, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d * -80, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="grid grid-cols-3 gap-6"
              >
                {visibleIndices.map((idx, pos) => (
                  <TestimonialCard
                    key={`${idx}-${pos}`}
                    testimonial={testimonials[idx]}
                    featured={pos === 1}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrows */}
          <button
            onClick={goPrev}
            className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700 transition-all z-10"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={goNext}
            className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700 transition-all z-10"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Mobile carousel — 1 visible */}
        <div className="md:hidden relative">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <TestimonialCard testimonial={testimonials[activeIndex]} featured />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile arrows */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={goPrev}
              className="w-9 h-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-sm"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={goNext}
              className="w-9 h-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-sm"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > activeIndex ? 1 : -1);
                setActiveIndex(i);
              }}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 h-2 bg-violet-600"
                  : "w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-violet-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  testimonial,
  featured,
}: {
  testimonial: (typeof testimonials)[number];
  featured?: boolean;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl p-6 border transition-all duration-300 relative h-full ${
        featured
          ? "border-violet-200 dark:border-violet-800 shadow-lg shadow-violet-500/10"
          : "border-gray-100 dark:border-gray-800 shadow-sm"
      }`}
    >
      <Quote className="absolute top-4 right-4 w-8 h-8 text-violet-100 dark:text-violet-900/50" />

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-2xl shrink-0`}
        >
          {testimonial.emoji}
        </div>
        <div>
          <div className="font-bold text-gray-900 dark:text-white text-sm">{testimonial.name}</div>
          <div className="text-xs text-gray-500">
            {testimonial.business} • {testimonial.city}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0.5 mb-3">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        &quot;{testimonial.text}&quot;
      </p>
    </div>
  );
}
