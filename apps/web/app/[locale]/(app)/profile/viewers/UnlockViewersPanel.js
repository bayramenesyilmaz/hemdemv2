"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { unlockProfileViewersAction } from "@/lib/actions/profileActions";

export function UnlockViewersPanel({ locale, cost }) {
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

    setViewers(result.data.viewers);
  }

  if (viewers) {
    if (viewers.length === 0) {
      return <EmptyState title={t("viewers.emptyTitle")} description={t("viewers.emptyBody")} />;
    }

    return (
      <div className="flex flex-col gap-2">
        {viewers.map(({ viewer }) => (
          <Link
            key={viewer.id}
            href={`/${locale}/u/${viewer.id}`}
            className="font-medium text-foreground underline"
          >
            {viewer.name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="button" variant="add" onClick={handleUnlock} loading={loading}>
        {t("viewers.unlockButton", { cost })}
      </Button>
    </div>
  );
}
