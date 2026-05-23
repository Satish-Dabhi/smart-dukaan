import { Skeleton } from "@/components/ui/skeleton";

export default function StorefrontLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* URL bar */}
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 flex-1 max-w-sm" />
        <Skeleton className="h-9 w-24 rounded-xl ml-auto" />
      </div>

      {/* Preview iframe placeholder */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="h-8 border-b border-border bg-muted/30 px-4 flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-3 rounded-full" />
        </div>
        <Skeleton className="h-[60vh] w-full rounded-none" />
      </div>
    </div>
  );
}
