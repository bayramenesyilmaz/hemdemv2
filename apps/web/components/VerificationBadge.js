import { ShieldIcon } from "@/components/icons";

/**
 * `verificationStatus === "approved"` olan profillerin isminin yanında
 * gösterilen küçük rozet — profil hero'su, herkese açık profil ve sohbet
 * başlığında kullanılıyor (bkz. plan Faz 6).
 */
export function VerificationBadge({ label, className = "" }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center text-primary ${className}`}
    >
      <ShieldIcon className="size-4" />
    </span>
  );
}
