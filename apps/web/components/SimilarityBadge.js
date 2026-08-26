import { cn } from "@/lib/cn";

/**
 * Uyum yüzdesi rozeti. Uygulamanın en önemli sayısı bu olduğu için
 * yüzdeye göre renk değiştirir: tam uyum vurgulu, yüksek uyum sıcak,
 * düşük uyum nötr — listede göz tarayarak "kiminle uyumluyum" sorusu
 * anında cevaplanabilsin diye.
 */
export function SimilarityBadge({ value, className }) {
  const tone =
    value >= 100
      ? "bg-gradient-primary text-primary-foreground shadow-card"
      : value >= 70
        ? "bg-primary/10 text-primary"
        : value >= 40
          ? "bg-muted text-foreground"
          : "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-sm font-bold tabular-nums",
        tone,
        className
      )}
    >
      %{value}
    </span>
  );
}

/**
 * Yüzdeyi ayrıca bir çubukla gösterir — rozet tek başına soyut kalıyor,
 * çubuk "ne kadar yakınız" hissini görselleştiriyor.
 */
export function SimilarityBar({ value }) {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full", value >= 70 ? "bg-gradient-primary" : "bg-primary/40")}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
