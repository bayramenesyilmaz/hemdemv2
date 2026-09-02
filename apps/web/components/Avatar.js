import Image from "next/image";
import { UserIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-20 w-20",
};

/**
 * Profil görseli. Avatar yoksa ikonlu nötr bir yer tutucu gösterir —
 * daha önce her sayfada tekrarlanan `<div><Image fill…/></div>` kalıbı
 * burada tek yerde toplandı.
 *
 * `unoptimized`, seed avatarları `data:` URI olduğu için gerekli:
 * Next'in görsel optimizasyon hattı data URI'ları işleyemez.
 *
 * `online` verilirse köşede küçük bir yeşil nokta gösterir (bkz.
 * `isOnline` — `packages/core/domain/entities/user.js`).
 */
export function Avatar({ src, name, size = "md", className, online = false }) {
  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-muted text-muted-foreground",
          SIZES[size],
          className
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={name ? `${name}` : ""}
            fill
            unoptimized={src.startsWith("data:")}
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <UserIcon className="h-1/2 w-1/2" />
          </span>
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 h-1/4 min-h-2.5 w-1/4 min-w-2.5 rounded-full border-2 border-background bg-emerald-500" />
      )}
    </div>
  );
}
