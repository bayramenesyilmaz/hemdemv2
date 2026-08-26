"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";
import { setUserBanStatusAction } from "@/lib/actions/adminActions";

export function AdminUsersList({ locale, users }) {
  const t = useI18n();
  const router = useRouter();
  const [pendingId, setPendingId] = useState(null);

  async function handleToggleBan(userId, nextBanned) {
    setPendingId(userId);
    await setUserBanStatusAction(userId, nextBanned);
    setPendingId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {users.map((user) => (
        <SectionCard key={user.id} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/u/${user.id}`} className="font-medium text-foreground underline">
              {user.name ?? user.id}
            </Link>
            {user.role === "admin" && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {t("admin.adminBadge")}
              </span>
            )}
            {user.isBanned && (
              <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                {t("admin.bannedBadge")}
              </span>
            )}
          </div>

          {user.role !== "admin" && (
            <Button
              type="button"
              variant={user.isBanned ? "confirm" : "delete"}
              disabled={pendingId === user.id}
              onClick={() => handleToggleBan(user.id, !user.isBanned)}
            >
              {user.isBanned ? t("admin.unban") : t("admin.ban")}
            </Button>
          )}
        </SectionCard>
      ))}
    </div>
  );
}
