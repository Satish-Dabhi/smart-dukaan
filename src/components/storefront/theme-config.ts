export const themeMap: Record<string, { from: string; to: string; accent: string }> = {
  grocery: { from: "from-emerald-600", to: "to-teal-700", accent: "bg-emerald-600" },
  cafe: { from: "from-amber-600", to: "to-orange-700", accent: "bg-amber-600" },
  bakery: { from: "from-rose-500", to: "to-pink-700", accent: "bg-rose-500" },
  restaurant: { from: "from-red-600", to: "to-orange-700", accent: "bg-red-600" },
  medical: { from: "from-blue-600", to: "to-cyan-700", accent: "bg-blue-600" },
  salon: { from: "from-purple-600", to: "to-pink-700", accent: "bg-purple-600" },
  retail: { from: "from-indigo-600", to: "to-violet-700", accent: "bg-indigo-600" },
  minimal: { from: "from-violet-600", to: "to-purple-700", accent: "bg-violet-600" },
};

export const themeAestheticMap: Record<
  string,
  {
    fontFamily: string;
    bgColor: string;
    cardStyle: string;
    isCulinaryMenu: boolean;
    buttonClass: string;
    badgeClass: string;
  }
> = {
  grocery: {
    fontFamily: "font-sans",
    bgColor: "bg-emerald-50/20 dark:bg-emerald-950/5",
    cardStyle:
      "rounded-2xl border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm",
    isCulinaryMenu: false,
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  cafe: {
    fontFamily: "font-serif",
    bgColor: "bg-[#FAF6F0] dark:bg-[#1C1917] text-stone-900 dark:text-stone-100",
    cardStyle:
      "rounded-xl border-amber-200 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-700 shadow-md",
    isCulinaryMenu: true,
    buttonClass: "bg-amber-700 hover:bg-amber-800 text-white",
    badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
  },
  bakery: {
    fontFamily: "font-sans",
    bgColor: "bg-[#FFF8F8] dark:bg-[#1E1B1B] text-rose-950 dark:text-rose-50",
    cardStyle:
      "rounded-3xl border-rose-100 dark:border-rose-900/30 hover:border-rose-300 dark:hover:border-rose-700 shadow-sm",
    isCulinaryMenu: false,
    buttonClass: "bg-rose-500 hover:bg-rose-600 text-white rounded-2xl",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
  },
  restaurant: {
    fontFamily: "font-serif",
    bgColor: "bg-[#FCFBF7] dark:bg-[#121212]",
    cardStyle:
      "rounded-lg border-red-200 dark:border-red-900/30 hover:border-red-400 dark:hover:border-red-700 shadow-md",
    isCulinaryMenu: true,
    buttonClass: "bg-red-600 hover:bg-red-700 text-white",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  },
  medical: {
    fontFamily: "font-sans",
    bgColor: "bg-slate-50 dark:bg-slate-950",
    cardStyle:
      "rounded-lg border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 shadow-none",
    isCulinaryMenu: false,
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  },
  salon: {
    fontFamily: "font-serif",
    bgColor: "bg-[#FAF5FF] dark:bg-[#181124] text-purple-950 dark:text-purple-50",
    cardStyle:
      "rounded-2xl border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700",
    isCulinaryMenu: false,
    buttonClass: "bg-purple-600 hover:bg-purple-700 text-white",
    badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
  },
  retail: {
    fontFamily: "font-sans",
    bgColor: "bg-white dark:bg-gray-950",
    cardStyle:
      "rounded-none border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 shadow-none",
    isCulinaryMenu: false,
    buttonClass:
      "bg-indigo-600 hover:bg-indigo-700 text-white uppercase tracking-wider rounded-none",
    badgeClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300",
  },
  minimal: {
    fontFamily: "font-sans",
    bgColor: "bg-white dark:bg-gray-950",
    cardStyle:
      "rounded-xl border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white shadow-none",
    isCulinaryMenu: false,
    buttonClass:
      "bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white",
    badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
};
