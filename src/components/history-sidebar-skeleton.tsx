import { Skeleton } from "@/components/ui/skeleton";

export function HistorySidebarSkeleton() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border md:flex">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-3">
        <Skeleton className="h-3.5 w-14" />
        <Skeleton className="size-6 rounded-md" />
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5 px-2 py-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </aside>
  );
}
