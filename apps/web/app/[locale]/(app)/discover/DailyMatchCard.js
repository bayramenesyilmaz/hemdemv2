import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { VerificationBadge } from "@/components/VerificationBadge";
import { SparkIcon } from "@/components/icons";

/**
 * Keşfet ekranının üstünde, kart destesini bozmadan gösterilen ince bir
 * şerit — cron ile hesaplanan `daily_matches` satırını referans alır (bkz.
 * `computeDailyMatch`). Eşleşme yoksa (cron henüz çalışmadıysa) hiç
 * render edilmez.
 */
export function DailyMatchCard({ locale, profile, t }) {
  return (
    <Link
      href={`/${locale}/u/${profile.id}`}
      className="flex items-center gap-3 rounded-2xl bg-gradient-surface p-3 shadow-soft transition-transform active:scale-[0.98]"
    >
      <Avatar src={profile.avatarUrl} name={profile.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-xs font-semibold text-primary">
          <SparkIcon className="size-3.5" />
          {t("discover.dailyMatchLabel")}
        </p>
        <p className="flex items-center gap-1 truncate text-sm font-medium text-foreground">
          {profile.name}
          {profile.verificationStatus === "approved" && (
            <VerificationBadge label={t("profile.verifiedBadgeLabel")} />
          )}
        </p>
      </div>
      <span className="shrink-0 text-xs font-medium text-primary">{t("discover.dailyMatchCta")}</span>
    </Link>
  );
}
