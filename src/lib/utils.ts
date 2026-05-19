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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
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
