"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/Button";
import { unlockProfileViewersAction } from "@/lib/actions/profileActions";

/**
 * İlk birkaç görüntüleyen zaten üst tarafta (sayfa bileşeninde) ücretsiz
 * gösteriliyor; burası sadece geri kalanları coin karşılığı açıyor —
 * `excludeIds` o önizlemede zaten gösterilenleri tekrar listelememek için.
 */
export function UnlockViewersPanel({ locale, cost, remainingCount, excludeIds }) {
  const t = useI18n();
  const [viewers, setViewers] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleUnlock() {
    setError(null);
    setLoading(true);
    const result = await unlockProfileViewersAction();
    setLoading(false);

    if (result.status === "error") {
      setError(t(`viewers.errors.${result.message}`));
      return;
    }

    const excluded = new Set(excludeIds ?? []);
    setViewers(result.data.viewers.filter(({ viewer }) => !excluded.has(viewer.id)));
  }

  if (viewers) {
    return (
      <div className="flex flex-col gap-2">
        {viewers.map(({ viewer }) => (
          <Link
            key={viewer.id}
            href={`/${locale}/u/${viewer.id}`}
            className="flex items-center gap-2 font-medium text-foreground"
          >
            <Avatar src={viewer.avatarUrl} name={viewer.name} size="sm" />
            <span className="underline">{viewer.name}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="button" variant="add" onClick={handleUnlock} loading={loading}>
        {t("viewers.unlockRemainingButton", { count: remainingCount, cost })}
      </Button>
    </div>
  );
}
