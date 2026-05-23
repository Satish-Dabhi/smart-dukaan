import { Skeleton } from "@/components/ui/skeleton";

export default function QrCodesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5 space-y-4 flex flex-col items-center">
            <Skeleton className="h-40 w-40 rounded-xl" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-32" />
            <div className="flex gap-2 w-full">
              <Skeleton className="h-9 flex-1 rounded-xl" />
              <Skeleton className="h-9 flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
