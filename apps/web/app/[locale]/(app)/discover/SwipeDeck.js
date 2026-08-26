"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { CloseIcon, HeartIcon } from "@/components/icons";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";
import { swipeAction } from "@/lib/actions/discoverActions";
import { SwipeCard } from "./SwipeCard";
import { QuickSignUpDialog } from "./QuickSignUpDialog";

const GATE_TEST_ERRORS = new Set(["gate_test_not_completed", "gate_test_threshold_not_met"]);

export function SwipeDeck({ locale, initialCandidates, isGuest }) {
  const t = useI18n();
  const router = useRouter();
  const [candidates] = useState(initialCandidates);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(null);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [guestLikeTarget, setGuestLikeTarget] = useState(null);

  const current = candidates[index];
  const upNext = candidates[index + 1];

  async function handleSwipe(action) {
    if (!current) return;
    setError(null);

    if (isGuest) {
      if (action === "like") {
        if (!current.allowGuestLikes) {
          setError(t("discover.guestLikeNotAllowed"));
          setIndex((i) => i + 1);
          return;
        }
        setGuestLikeTarget(current);
        return;
      }
      setIndex((i) => i + 1);
      return;
    }

    const result = await swipeAction(current.id, action);
    if (result.status === "error") {
      setError(GATE_TEST_ERRORS.has(result.message) ? t(`discover.errors.${result.message}`) : result.message);
      setIndex((i) => i + 1);
      return;
    }

    if (result.data.matched) {
      setMatchedProfile(current);
    }
    setIndex((i) => i + 1);
  }

  if (!current) {
    return (
      <div className="flex min-h-0 flex-1 items-center">
        <EmptyState title={t("discover.emptyTitle")} description={t("discover.emptyBody")} />
      </div>
    );
  }

  return (
    // Deste kalan dikey alanı doldurur (sabit bir yükseklik yerine flex):
    // böylece başlık/aksiyon çubuğu değişse de sayfa asla taşmaz.
    // `min-h-0` olmadan flex çocuğu içeriğinden küçülemez ve taşar.
    <div className="flex min-h-0 flex-1 flex-col items-center gap-4">
      <div className="relative w-full min-h-0 max-w-sm flex-1">
        {upNext && <SwipeCard key={upNext.id} candidate={upNext} locale={locale} isTop={false} />}
        <SwipeCard key={current.id} candidate={current} locale={locale} isTop onSwipe={handleSwipe} />
      </div>

      {error && <p className="shrink-0 text-center text-sm text-destructive">{error}</p>}

      {/*
        Bu iki aksiyon Button bileşenini kullanmaz: dairesel, ikon-only
        birer FAB'lar ve Button'ın taban `rounded-lg`/`px-5` stilleriyle
        çakışıyorlardı (cn yalnızca sınıfları birleştirir, Tailwind
        çakışmalarını çözmez).
      */}
      <div className="flex shrink-0 items-center gap-6">
        <button
          type="button"
          onClick={() => handleSwipe("dislike")}
          aria-label={t("discover.nope")}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-lg transition-transform active:scale-95"
        >
          <CloseIcon className="h-7 w-7" />
        </button>
        <button
          type="button"
          onClick={() => handleSwipe("like")}
          aria-label={t("discover.like")}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
        >
          <HeartIcon className="h-7 w-7" />
        </button>
      </div>

      <Dialog open={Boolean(matchedProfile)} onOpenChange={(open) => !open && setMatchedProfile(null)}>
        <DialogContent>
          <DialogTitle>{t("discover.matchTitle")}</DialogTitle>
          <DialogDescription>
            {matchedProfile && t("discover.matchBody", { name: matchedProfile.name })}
          </DialogDescription>
          <div className="mt-4 flex justify-end">
            <Button type="button" variant="confirm" onClick={() => setMatchedProfile(null)}>
              {t("discover.keepSwiping")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {guestLikeTarget && (
        <QuickSignUpDialog
          locale={locale}
          target={guestLikeTarget}
          onClose={() => setGuestLikeTarget(null)}
          onSuccess={() => router.push(`/${locale}/onboarding`)}
        />
      )}
    </div>
  );
}
