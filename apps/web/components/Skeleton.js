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

/**
 * Form sayfaları (test oluştur, profil düzenle…) için. `ListPageSkeleton`
 * bunlar için kullanılınca gerçek içerik geldiğinde boy tamamen farklı
 * olduğundan sayfa aniden zıplıyordu (bkz. /tests/create'de "kayma"
 * şikayeti) — bu iskelet gerçek formun yaklaşık boyuna oturur.
 */
export function FormPageSkeleton() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
      <Skeleton className="h-11 w-full" />
    </main>
  );
}

/**
 * Tek bir kayda odaklanan detay sayfaları (test çöz, sonuç, karşılaştır…)
 * için. Liste iskeletindeki eşit yükseklikli kart sırası yerine, bir
 * başlık ve farklı yükseklikte birkaç blok — gerçek detay sayfalarının
 * genel silüetine liste görünümünden çok daha yakın.
 */
export function DetailPageSkeleton() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </main>
  );
}

/** Sohbet ekranı: başlık + değişen genişlikte balonlar + alttaki yazı alanı. */
export function ChatPageSkeleton() {
  return (
    <main className="mx-auto flex h-[calc(100dvh-7.5rem-env(safe-area-inset-bottom))] max-w-2xl flex-col gap-4 px-4 py-4 lg:h-[calc(100dvh-4rem)] lg:px-6">
      <Skeleton className="h-7 w-40" />
      <div className="flex flex-1 flex-col justify-end gap-2 rounded-2xl border border-border p-4">
        <Skeleton className="h-12 w-2/3 self-start rounded-2xl" />
        <Skeleton className="h-12 w-1/2 self-end rounded-2xl" />
        <Skeleton className="h-12 w-3/5 self-start rounded-2xl" />
      </div>
      <Skeleton className="h-14 w-full" />
    </main>
  );
}
