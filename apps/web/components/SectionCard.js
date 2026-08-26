import { cn } from "@/lib/cn";

/**
 * Tutarlı kart yüzeyi — profil, test, gönderi gibi tüm bölümlerde aynı
 * çerçeve/boşluk dilini korumak için. `interactive` verilirse tıklanabilir
 * kartlara hafif bir yükselme/geri bildirim eklenir.
 */
export function SectionCard({ className, interactive = false, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-soft",
        interactive &&
          "transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card active:translate-y-0 active:scale-[0.99]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
