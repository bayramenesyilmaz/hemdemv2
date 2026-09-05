"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { activateBoostAction } from "@/lib/actions/profileActions";

function minutesLeft(boostedUntil) {
  if (!boostedUntil) return 0;
  const diffMs = new Date(boostedUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 60000));
}

/**
 * Coin karşılığı sınırlı süre keşfette öne çıkma (bkz. activateBoost
 * usecase'i + fetchDiscoverCandidates'teki sortByBoost). Aktifken geri
 * sayım her 30sn'de bir tazelenir — sayfa yeniden yüklenmeden süre
 * dolunca buton kendiliğinden tekrar tıklanabilir hale gelir.
 */
export function BoostButton({ cost, initialBoostedUntil }) {
  const t = useI18n();
  const router = useRouter();
  const [boostedUntil, setBoostedUntil] = useState(initialBoostedUntil);
  const [remaining, setRemaining] = useState(() => minutesLeft(initialBoostedUntil));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!boostedUntil) return;
    const interval = setInterval(() => setRemaining(minutesLeft(boostedUntil)), 30000);
    return () => clearInterval(interval);
  }, [boostedUntil]);

  async function handleBoost() {
    setError(null);
    setLoading(true);
    const result = await activateBoostAction();
    setLoading(false);

    if (result.status === "error") {
      setError(t(`viewers.errors.${result.message}`));
      return;
    }

    setBoostedUntil(result.data.boostedUntil);
    setRemaining(minutesLeft(result.data.boostedUntil));
    // Coin bakiyesi bu bileşenin dışında, sunucu tarafında render edilen
    // profil sayfasında gösteriliyor — düşülen 30 coin ekranda yansısın
    // diye sunucu verisini tazeliyoruz (bkz. AdWatchTierList.js'teki aynı
    // desen).
    router.refresh();
  }

  if (remaining > 0) {
    return <span className="text-sm font-semibold text-primary">{t("profile.boostActive", { minutes: remaining })}</span>;
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="button" variant="add" onClick={handleBoost} loading={loading}>
        {t("profile.boostButton", { cost })}
      </Button>
    </div>
  );
}
