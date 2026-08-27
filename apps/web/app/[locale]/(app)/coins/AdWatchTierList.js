"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";
import { grantAdWatchRewardAction } from "@/lib/actions/coinActions";

export function AdWatchTierList({ tiers }) {
  const t = useI18n();
  const router = useRouter();
  const [watchingTier, setWatchingTier] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [rewardMessage, setRewardMessage] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function startWatching(tierConfig) {
    setRewardMessage(null);
    setWatchingTier(tierConfig.tier);
    setRemaining(tierConfig.seconds);

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          finishWatching(tierConfig.tier);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function finishWatching(tier) {
    const result = await grantAdWatchRewardAction(tier);
    setWatchingTier(null);

    if (result.status === "success") {
      setRewardMessage(t("coins.rewardGranted", { reward: result.data.reward }));
      router.refresh();
    }
  }

  const highestTier = Math.max(...tiers.map((tierConfig) => tierConfig.tier));

  return (
    <div className="flex flex-col gap-3">
      {rewardMessage && <p className="text-sm text-primary">{rewardMessage}</p>}

      {tiers.map((tierConfig) => {
        const isMostAdvantageous = tierConfig.tier === highestTier;
        const isWatching = watchingTier === tierConfig.tier;

        return (
          <SectionCard
            key={tierConfig.tier}
            className={`flex items-center justify-between gap-4 ${isMostAdvantageous ? "border-primary" : ""}`}
          >
            <div className="min-w-0">
              {/* Rozet aynı satırda metnin İÇİNE gömülüydü (inline span);
                  "120 saniyelik reklam" gibi uzun etiketlerle satır
                  sardığında rozet metnin üzerine biniyordu (gerçek
                  ölçümle doğrulandı: ikisi de aynı x koordinatında
                  başlıyordu). Rozeti ayrı bir satıra alıp kesin bir
                  boşluk (mb-1) veriyoruz ki hiçbir uzunlukta çakışmasın. */}
              {isMostAdvantageous && (
                <span className="mb-1 inline-block w-fit rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  {t("coins.mostAdvantageous")}
                </span>
              )}
              <p className="font-medium text-foreground">
                {t("coins.tierSeconds", { seconds: tierConfig.seconds })}
              </p>
              <p className="text-sm text-muted-foreground">{t("coins.tierReward", { reward: tierConfig.coinReward })}</p>
            </div>

            <Button
              type="button"
              variant="add"
              disabled={watchingTier !== null}
              onClick={() => startWatching(tierConfig)}
              className="shrink-0 whitespace-nowrap"
            >
              {isWatching ? t("coins.watching", { remaining }) : t("coins.watchButton")}
            </Button>
          </SectionCard>
        );
      })}
    </div>
  );
}
