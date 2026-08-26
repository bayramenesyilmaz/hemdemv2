import { cn } from "@/lib/cn";

/**
 * Tutarlı kart yüzeyi — profil, test, gönderi gibi tüm bölümlerde aynı
 * çerçeve/boşluk dilini korumak için.
 */
export function SectionCard({ className, children, ...props }) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-4 text-card-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
}
