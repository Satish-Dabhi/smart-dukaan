"use client";

import React from "react";
import {
  Carrot,
  Apple,
  Milk,
  Egg,
  Coffee,
  Cookie,
  Cake,
  Pill,
  Shirt,
  Scissors,
  Sparkles,
  Package,
  Tag,
  ShoppingBag,
  HeartPulse,
  Flame,
  Leaf,
  GlassWater,
  Activity,
  User,
  Coffee as TeaIcon
} from "lucide-react";

interface FallbackConfig {
  icon: React.ComponentType<any>;
  themeClasses: string; // Tailored HSL gradient & text colors
}

// Curated list of keywords mapping to highly specific, beautiful visual configurations
const KEYWORD_CONFIGS: Array<{ keywords: string[]; config: FallbackConfig }> = [
  {
    // Fruits & Veg (Emerald/Teal Theme)
    keywords: [
      "tomato", "onion", "potato", "mango", "spinach", "fruit", "vegetable", "veg", 
      "banana", "apple", "orange", "lemon", "lime", "cucumber", "garlic", "ginger", 
      "chili", "chilli", "berry", "grape", "pear", "peach", "plum", "salad", "carrot", 
      "mint", "coriander", "cabbage", "broccoli"
    ],
    config: {
      icon: Carrot,
      themeClasses: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    }
  },
  {
    // Dairy & Eggs (Sky/Blue Theme)
    keywords: [
      "milk", "curd", "butter", "cheese", "egg", "paneer", "ghee", "yogurt", "cream", 
      "dairy", "dahi", "buttermilk", "lassi"
    ],
    config: {
      icon: Milk,
      themeClasses: "from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    }
  },
  {
    // Beverages & Drinks (Orange/Amber Theme)
    keywords: [
      "coffee", "tea", "chai", "soda", "coke", "pepsi", "drink", "beverage", "juice", 
      "smoothie", "water", "espresso", "cappuccino", "latte", "mocha", "shake", "cold drink"
    ],
    config: {
      icon: Coffee,
      themeClasses: "from-orange-500/10 to-amber-600/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    }
  },
  {
    // Snacks, Sweets & Bakery (Rose/Pink Theme)
    keywords: [
      "cookie", "biscuit", "chocolate", "cake", "brownie", "pastry", "sandwich", 
      "burger", "pizza", "bun", "toast", "snack", "bhujia", "chips", "namkeen", 
      "sweet", "mithai", "dessert", "samosa", "kachori", "wrap", "roll"
    ],
    config: {
      icon: Cookie,
      themeClasses: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    }
  },
  {
    // Pharmacy & Health (Teal/Cyan Theme)
    keywords: [
      "pill", "tablet", "medicine", "syrup", "capsule", "bandage", "health", "medical", 
      "pharma", "multivitamin", "painkiller", "ointment"
    ],
    config: {
      icon: Pill,
      themeClasses: "from-cyan-500/10 to-blue-600/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    }
  },
  {
    // Personal Care & Cleaning (Indigo/Purple Theme)
    keywords: [
      "soap", "toothpaste", "brush", "shampoo", "wash", "clean", "oil", "lotion", 
      "detergent", "handwash", "facewash", "deo", "perfume", "conditioner"
    ],
    config: {
      icon: Sparkles,
      themeClasses: "from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    }
  },
  {
    // Clothes & Fashion (Violet/Fuchsia Theme)
    keywords: [
      "shirt", "pant", "jeans", "dress", "top", "saree", "kurti", "clothing", "clothes", 
      "fashion", "shoe", "bag", "purse", "wallet", "apparel"
    ],
    config: {
      icon: Shirt,
      themeClasses: "from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    }
  },
  {
    // Salon & Beauty (Fuchsia/Pink Theme)
    keywords: [
      "hair", "cut", "salon", "spa", "makeup", "lipstick", "beauty", "grooming", 
      "scissors", "massage", "facial"
    ],
    config: {
      icon: Scissors,
      themeClasses: "from-fuchsia-500/10 to-pink-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20",
    }
  },
  {
    // Grains, Dal & Grains (Amber/Yellow Theme)
    keywords: [
      "rice", "dal", "pulses", "wheat", "atta", "flour", "grain", "oats", "cereal", 
      "maida", "besan", "suji", "sugar", "salt", "spices", "masala"
    ],
    config: {
      icon: Leaf,
      themeClasses: "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    }
  }
];

// Fallback when no keywords match
const DEFAULT_CONFIG: FallbackConfig = {
  icon: Package,
  themeClasses: "from-violet-500/10 to-indigo-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
};

interface ProductImageFallbackProps {
  name: string;
  className?: string;
  iconClassName?: string;
  showOverlay?: boolean;
}

export function ProductImageFallback({
  name,
  className = "w-full h-full",
  iconClassName = "w-10 h-10",
  showOverlay = true,
}: ProductImageFallbackProps) {
  // Find appropriate icon config based on keyword matching
  const lowerName = name.toLowerCase();
  const matched = KEYWORD_CONFIGS.find((item) =>
    item.keywords.some((keyword) => lowerName.includes(keyword))
  );

  const { icon: IconComponent, themeClasses } = matched ? matched.config : DEFAULT_CONFIG;

  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br border overflow-hidden transition-all duration-300 ${themeClasses} ${className}`}
    >
      {/* Abstract Blueprint Grid Overlay to prevent "big empty box" feeling */}
      {showOverlay && (
        <svg
          className="absolute inset-0 w-full h-full text-current opacity-[0.06] select-none pointer-events-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50%" cy="50%" r="35%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="20%" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="0.5" />
          <path d="M0 0 L100% 100% M100% 0 L0 100%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        </svg>
      )}

      {/* Floating Micro Decors */}
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-current opacity-30 animate-pulse" />
      <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-current opacity-20" />

      {/* Main Stylized Icon */}
      <IconComponent
        className={`relative z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)] transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${iconClassName}`}
      />
    </div>
  );
}
