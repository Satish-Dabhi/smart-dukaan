import { Skeleton } from "@/components/ui/skeleton";

export default function StorefrontLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white">
        <Skeleton className="h-48 sm:h-64 w-full opacity-30" />
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-start gap-4">
          <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-64 bg-white/20" />
            <Skeleton className="h-4 w-48 bg-white/20" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-28 rounded-full bg-white/20" />
              <Skeleton className="h-7 w-24 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
          <Skeleton className="h-9 w-full" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
