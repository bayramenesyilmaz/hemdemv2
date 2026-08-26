import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex h-[calc(100dvh-7.5rem-env(safe-area-inset-bottom))] w-full max-w-md flex-col gap-4 px-4 py-4 lg:h-[calc(100dvh-4rem)] lg:py-8">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-11 w-24" />
      </div>
      <Skeleton className="min-h-0 w-full flex-1 rounded-2xl" />
      <div className="flex shrink-0 justify-center gap-6">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    </main>
  );
}
