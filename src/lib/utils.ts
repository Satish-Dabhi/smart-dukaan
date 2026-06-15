import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, symbol = "₹"): string {
  return `${symbol}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: string | Date, locale = "en-IN"): string {
  return new Date(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date, locale = "en-IN"): string {
  return new Date(date).toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateInvoiceNumber(prefix: string, counter: number): string {
  return `${prefix}${String(counter).padStart(5, "0")}`;
}

export function calculateGST(
  amount: number,
  gstPercent: number,
  type: "inclusive" | "exclusive" = "exclusive"
) {
  if (type === "exclusive") {
    const gst = (amount * gstPercent) / 100;
    const cgst = gst / 2;
    const sgst = gst / 2;
    return { gst, cgst, sgst, total: amount + gst };
  } else {
    const gst = amount - amount / (1 + gstPercent / 100);
    const cgst = gst / 2;
    const sgst = gst / 2;
    return { gst, cgst, sgst, total: amount };
  }
}

export function generateWhatsAppMessage(
  businessName: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number
): string {
  const itemsList = items
    .map((item) => `${item.quantity}x ${item.name} - ₹${item.price * item.quantity}`)
    .join("\n");
  return `Hello ${businessName},\n\nI want to order:\n${itemsList}\n\nTotal: ₹${total}\n\nPlease confirm my order. Thank you!`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getSearchParam(value: string | string[] | undefined, fallback = ""): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export function buildQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

/** Escape a string for safe use inside a MongoDB $regex query. Prevents ReDoS. */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Sanitize a string for safe HTML embedding (for email templates etc.). */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Converts a number to Indian English words (for GST invoices).
 * e.g., 1234.50 → "One Thousand Two Hundred Thirty-Four Rupees and Fifty Paise Only"
 */
export function amountInWords(amount: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function numToWords(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "") + " ";
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred " + numToWords(n % 100);
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + "Thousand " + numToWords(n % 1000);
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + "Lakh " + numToWords(n % 100000);
    return numToWords(Math.floor(n / 10000000)) + "Crore " + numToWords(n % 10000000);
  }

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let result = numToWords(rupees).trim() + " Rupee" + (rupees !== 1 ? "s" : "");
  if (paise > 0) result += " and " + numToWords(paise).trim() + " Paise";
  return result + " Only";
}

/** Rounds a number to the nearest integer and returns the round-off difference. */
export function calcRoundOff(raw: number): { rounded: number; roundOff: number } {
  const rounded = Math.round(raw);
  const roundOff = parseFloat((rounded - raw).toFixed(2));
  return { rounded, roundOff };
}
