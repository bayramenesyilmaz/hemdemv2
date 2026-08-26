import { cn } from "@/lib/cn";

/**
 * Yükleme iskeleti. `loading.js` dosyalarıyla birlikte kullanılır:
 * Next, sunucu bileşeni veriyi beklerken bunu anında gösterir — böylece
 * gezinme sırasında ekran donmuş gibi görünmez.
 */
export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

/** Kart listesi olan sayfalar (testler, gönderiler, mesajlar…) için. */
export function ListPageSkeleton({ rows = 5 }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-11 w-24" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    </main>
  );
}
