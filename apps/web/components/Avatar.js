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
 */
export function Avatar({ src, name, size = "md", className }) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-muted text-muted-foreground",
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
  );
}
