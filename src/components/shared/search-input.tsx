"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export function SearchInput({ placeholder, className }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Controlled state for immediate typing feedback
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const t = useTranslations("common");

  // Sync state if URL changes externally
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchParams.get("q") || "");
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setQuery(value);

    // Debounce the URL update
    const timeout = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set("q", value);
        } else {
          params.delete("q");
        }

        // Reset page to 1 on new search
        params.delete("page");

        router.push(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timeout);
  };

  return (
    <Input
      placeholder={placeholder || t("searchPlaceholder")}
      value={query}
      onChange={(e) => {
        handleSearch(e.target.value);
      }}
      startIcon={
        <Search className={`w-4 h-4 ${isPending ? "animate-pulse text-violet-500" : ""}`} />
      }
      className={className}
    />
  );
}
