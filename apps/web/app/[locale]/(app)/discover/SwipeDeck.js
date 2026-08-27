"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { CloseIcon, HeartIcon, MessagesIcon } from "@/components/icons";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";
import { swipeAction } from "@/lib/actions/discoverActions";
import { SendMessageDialog } from "../u/[id]/SendMessageDialog";
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
    // böylece başlık değişse de sayfa asla taşmaz. `min-h-0` olmadan flex
    // çocuğu içeriğinden küçülemez ve taşar.
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative w-full min-h-0 flex-1">
        {upNext && <SwipeCard key={upNext.id} candidate={upNext} locale={locale} isTop={false} />}
        <SwipeCard key={current.id} candidate={current} locale={locale} isTop onSwipe={handleSwipe} />
      </div>

      {error && (
        <p className="shrink-0 bg-background px-4 py-2 text-center text-sm text-destructive">{error}</p>
      )}

      {/*
        Aksiyonlar artık desteyle birlikte kayan bir satır değil, alt
        navigasyonun (mobil) hemen üstünde sabit duran bir çubuk — modern
        keşfet ekranlarında beklenen davranış. Butonlar Button bileşenini
        kullanmaz: dairesel, ikon-only FAB'lar Button'ın taban
        `rounded-lg`/`px-5` stilleriyle çakışıyordu (cn sadece sınıfları
        birleştirir, Tailwind çakışmalarını çözmez).
      */}
      {/* `lg:left-64`: masaüstünde sabit sidebar'ın genişliği kadar
          içeri kayıyor ki `justify-center` gerçekten içerik sütununun
          (`main`'in `mx-auto max-w-md`'i) ortasına denk gelsin, tüm
          viewport'un değil. */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex justify-center gap-5 pb-4 lg:left-64 lg:bottom-6">
        <button
          type="button"
          onClick={() => handleSwipe("dislike")}
          aria-label={t("discover.nope")}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-lg transition-transform active:scale-95"
        >
          <CloseIcon className="h-7 w-7" />
        </button>

        {!isGuest && (
          <SendMessageDialog
            locale={locale}
            recipientId={current.id}
            recipientName={current.name}
            trigger={
              <button
                type="button"
                aria-label={t("messages.sendMessageButton")}
                className="flex h-14 w-14 items-center justify-center self-center rounded-full border border-border bg-card text-primary shadow-lg transition-transform active:scale-95"
              >
                <MessagesIcon className="h-6 w-6" />
              </button>
            }
          />
        )}

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
