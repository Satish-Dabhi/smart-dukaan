"use client";
import { cn } from "@/lib/utils";

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileCard({ children, className, onClick }: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm",
        onClick &&
          "cursor-pointer hover:border-violet-200 dark:hover:border-violet-800 transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileCardRowProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

export function MobileCardRow({ label, value, valueClassName }: MobileCardRowProps) {
  return (
    <div className="flex justify-between items-start gap-3 py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span
        className={cn(
          "text-xs font-medium text-gray-900 dark:text-white text-right",
          valueClassName
        )}
      >
        {value}
      </span>
    </div>
  );
}
