import { cn } from "@/lib/cn";

/**
 * Reklam alanı yer tutucusu. Gerçek bir reklam ağı (AdSense vb.)
 * bağlanana kadar görsel olarak yerini tutar; ağ bağlandığında yalnızca
 * bu bileşenin içi değişir, çağrıldığı sayfalar değişmez.
 *
 * Yer tutucu bilinçli olarak "reklam" olduğunu söyler ve sabit yükseklik
 * kaplar — reklam sonradan yüklendiğinde sayfanın zıplamaması (layout
 * shift) için alan baştan ayrılmış olur.
 */
export function AdSlot({ label, className }) {
  return (
    <div
      className={cn(
        "flex h-24 w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50 text-xs font-medium uppercase tracking-widest text-muted-foreground",
        className
      )}
      aria-label={label}
    >
      {label}
    </div>
  );
}
