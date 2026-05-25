"use client";

import React from "react";
import {
  Carrot,
  Milk,
  Coffee,
  Cookie,
  Pill,
  Shirt,
  Scissors,
  Sparkles,
  Package,
  Leaf,
  ShoppingBag,
  Apple,
  Cake,
  Utensils,
  Tv,
  Candy,
  BookOpen,
  Flame,
  Heart,
  Tag,
  Gift,
  Gem,
  Crown,
  Banana,
  Egg,
  Wheat,
  Grape,
  Cherry,
  CupSoda,
  GlassWater,
  Croissant,
  IceCream,
  Pizza,
  Soup,
  ChefHat,
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Smile,
  Clock,
  Truck,
} from "lucide-react";

interface FallbackConfig {
  icon: React.ComponentType<{ className?: string }>;
  themeClasses: string; // Tailored HSL gradient & text colors
}

// Curated list of keywords mapping to highly specific, beautiful visual configurations
const KEYWORD_CONFIGS: Array<{ keywords: string[]; config: FallbackConfig }> = [
  {
    // Fruits & Veg (Emerald/Teal Theme)
    keywords: [
      "tomato",
      "onion",
      "potato",
      "mango",
      "spinach",
      "fruit",
      "vegetable",
      "veg",
      "banana",
      "apple",
      "orange",
      "lemon",
      "lime",
      "cucumber",
      "garlic",
      "ginger",
      "chili",
      "chilli",
      "berry",
      "grape",
      "pear",
      "peach",
      "plum",
      "salad",
      "carrot",
      "mint",
      "coriander",
      "cabbage",
      "broccoli",
    ],
    config: {
      icon: Carrot,
      themeClasses:
        "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
  },
  {
    // Dairy & Eggs (Sky/Blue Theme)
    keywords: [
      "milk",
      "curd",
      "butter",
      "cheese",
      "egg",
      "paneer",
      "ghee",
      "yogurt",
      "cream",
      "dairy",
      "dahi",
      "buttermilk",
      "lassi",
    ],
    config: {
      icon: Milk,
      themeClasses:
        "from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    },
  },
  {
    // Beverages & Drinks (Orange/Amber Theme)
    keywords: [
      "coffee",
      "tea",
      "chai",
      "soda",
      "coke",
      "pepsi",
      "drink",
      "beverage",
      "juice",
      "smoothie",
      "water",
      "espresso",
      "cappuccino",
      "latte",
      "mocha",
      "shake",
      "cold drink",
    ],
    config: {
      icon: Coffee,
      themeClasses:
        "from-orange-500/10 to-amber-600/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    },
  },
  {
    // Snacks, Sweets & Bakery (Rose/Pink Theme)
    keywords: [
      "cookie",
      "biscuit",
      "chocolate",
      "cake",
      "brownie",
      "pastry",
      "sandwich",
      "burger",
      "pizza",
      "bun",
      "toast",
      "snack",
      "bhujia",
      "chips",
      "namkeen",
      "sweet",
      "mithai",
      "dessert",
      "samosa",
      "kachori",
      "wrap",
      "roll",
    ],
    config: {
      icon: Cookie,
      themeClasses:
        "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
  },
  {
    // Pharmacy & Health (Teal/Cyan Theme)
    keywords: [
      "pill",
      "tablet",
      "medicine",
      "syrup",
      "capsule",
      "bandage",
      "health",
      "medical",
      "pharma",
      "multivitamin",
      "painkiller",
      "ointment",
    ],
    config: {
      icon: Pill,
      themeClasses:
        "from-cyan-500/10 to-blue-600/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    },
  },
  {
    // Personal Care & Cleaning (Indigo/Purple Theme)
    keywords: [
      "soap",
      "toothpaste",
      "brush",
      "shampoo",
      "wash",
      "clean",
      "oil",
      "lotion",
      "detergent",
      "handwash",
      "facewash",
      "deo",
      "perfume",
      "conditioner",
    ],
    config: {
      icon: Sparkles,
      themeClasses:
        "from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    },
  },
  {
    // Clothes & Fashion (Violet/Fuchsia Theme)
    keywords: [
      "shirt",
      "pant",
      "jeans",
      "dress",
      "top",
      "saree",
      "kurti",
      "clothing",
      "clothes",
      "fashion",
      "shoe",
      "bag",
      "purse",
      "wallet",
      "apparel",
    ],
    config: {
      icon: Shirt,
      themeClasses:
        "from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    },
  },
  {
    // Salon & Beauty (Fuchsia/Pink Theme)
    keywords: [
      "hair",
      "cut",
      "salon",
      "spa",
      "makeup",
      "lipstick",
      "beauty",
      "grooming",
      "scissors",
      "massage",
      "facial",
    ],
    config: {
      icon: Scissors,
      themeClasses:
        "from-fuchsia-500/10 to-pink-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20",
    },
  },
  {
    // Grains, Dal & Grains (Amber/Yellow Theme)
    keywords: [
      "rice",
      "dal",
      "pulses",
      "wheat",
      "atta",
      "flour",
      "grain",
      "oats",
      "cereal",
      "maida",
      "besan",
      "suji",
      "sugar",
      "salt",
      "spices",
      "masala",
    ],
    config: {
      icon: Leaf,
      themeClasses:
        "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
  },
];

// Fallback when no keywords match
const DEFAULT_CONFIG: FallbackConfig = {
  icon: Package,
  themeClasses:
    "from-violet-500/10 to-indigo-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
};

// Custom Icon Maps matching the options available in Add/Edit Product
const CUSTOM_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  shoppingBag: ShoppingBag,
  apple: Apple,
  carrot: Carrot,
  coffee: Coffee,
  cake: Cake,
  cookie: Cookie,
  candy: Candy,
  utensils: Utensils,
  flame: Flame,
  pill: Pill,
  heart: Heart,
  scissors: Scissors,
  shirt: Shirt,
  tv: Tv,
  sparkles: Sparkles,
  milk: Milk,
  bookOpen: BookOpen,
  leaf: Leaf,
  tag: Tag,
  gift: Gift,
  gem: Gem,
  crown: Crown,
  banana: Banana,
  egg: Egg,
  wheat: Wheat,
  grape: Grape,
  cherry: Cherry,
  cupSoda: CupSoda,
  glassWater: GlassWater,
  croissant: Croissant,
  iceCream: IceCream,
  pizza: Pizza,
  soup: Soup,
  chefHat: ChefHat,
  smartphone: Smartphone,
  laptop: Laptop,
  headphones: Headphones,
  home: Home,
  smile: Smile,
  clock: Clock,
  truck: Truck,
};

const CUSTOM_THEME_MAP: Record<string, string> = {
  shoppingBag:
    "from-violet-500/10 to-indigo-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  apple:
    "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  carrot:
    "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  coffee:
    "from-orange-500/10 to-amber-600/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  cake: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  cookie: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  candy: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  utensils: "from-red-500/10 to-orange-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  flame: "from-red-500/10 to-orange-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  pill: "from-cyan-500/10 to-blue-600/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  heart: "from-red-500/10 to-pink-500/10 text-red-500 dark:text-red-400 border-red-500/20",
  scissors:
    "from-fuchsia-500/10 to-pink-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20",
  shirt:
    "from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  tv: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  sparkles:
    "from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  milk: "from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  bookOpen:
    "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  leaf: "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  tag: "from-slate-500/10 to-gray-600/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  gift: "from-rose-500/10 to-red-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  gem: "from-cyan-500/10 to-indigo-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  crown:
    "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  banana:
    "from-yellow-400/10 to-amber-400/10 text-yellow-600 dark:text-yellow-450 border-yellow-400/20",
  egg: "from-yellow-500/10 to-orange-400/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
  wheat:
    "from-amber-500/10 to-yellow-600/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  grape:
    "from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  cherry: "from-red-500/10 to-rose-600/10 text-red-600 dark:text-red-400 border-red-500/20",
  cupSoda: "from-pink-500/10 to-orange-400/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  glassWater: "from-cyan-400/10 to-sky-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-400/20",
  croissant:
    "from-amber-600/10 to-orange-500/10 text-amber-700 dark:text-amber-400 border-amber-600/20",
  iceCream: "from-pink-400/10 to-rose-400/10 text-pink-500 dark:text-pink-400 border-pink-400/20",
  pizza: "from-red-500/10 to-yellow-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  soup: "from-amber-500/10 to-red-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  chefHat:
    "from-slate-500/10 to-zinc-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  smartphone:
    "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  laptop: "from-slate-600/10 to-zinc-700/10 text-slate-700 dark:text-slate-400 border-slate-600/20",
  headphones:
    "from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  home: "from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  smile:
    "from-yellow-400/10 to-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20",
  clock:
    "from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  truck: "from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};
interface ProductImageFallbackProps {
  name: string;
  icon?: string;
  className?: string;
  iconClassName?: string;
  showOverlay?: boolean;
}

export function ProductImageFallback({
  name,
  icon,
  className = "w-full h-full",
  iconClassName = "w-10 h-10",
  showOverlay = true,
}: ProductImageFallbackProps) {
  // If custom icon exists and is valid, use it
  const customIconComponent = icon ? CUSTOM_ICON_MAP[icon] : null;
  const customThemeClasses = icon ? CUSTOM_THEME_MAP[icon] : null;

  let IconComponent: React.ComponentType<{ className?: string }> = Package;
  let themeClasses = DEFAULT_CONFIG.themeClasses;

  if (customIconComponent && customThemeClasses) {
    IconComponent = customIconComponent;
    themeClasses = customThemeClasses;
  } else {
    // Find appropriate icon config based on keyword matching
    const lowerName = name.toLowerCase();
    const matched = KEYWORD_CONFIGS.find((item) =>
      item.keywords.some((keyword) => lowerName.includes(keyword))
    );

    if (matched) {
      IconComponent = matched.config.icon;
      themeClasses = matched.config.themeClasses;
    } else {
      IconComponent = DEFAULT_CONFIG.icon;
      themeClasses = DEFAULT_CONFIG.themeClasses;
    }
  }

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
          <circle
            cx="50%"
            cy="50%"
            r="35%"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle cx="50%" cy="50%" r="20%" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="0.5" />
          <path
            d="M0 0 L100% 100% M100% 0 L0 100%"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
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
