"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
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
    return <EmptyState title={t("discover.emptyTitle")} description={t("discover.emptyBody")} />;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-[480px] w-full max-w-sm">
        {upNext && <SwipeCard key={upNext.id} candidate={upNext} locale={locale} isTop={false} />}
        <SwipeCard key={current.id} candidate={current} locale={locale} isTop onSwipe={handleSwipe} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSwipe("dislike")}
          aria-label={t("discover.nope")}
          className="h-14 w-14 rounded-full text-2xl"
        >
          ✕
        </Button>
        <Button
          type="button"
          variant="confirm"
          onClick={() => handleSwipe("like")}
          aria-label={t("discover.like")}
          className="h-14 w-14 rounded-full text-2xl"
        >
          ♥
        </Button>
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
