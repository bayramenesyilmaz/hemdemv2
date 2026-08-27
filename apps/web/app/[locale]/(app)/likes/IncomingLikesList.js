"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";
import { CloseIcon, HeartIcon } from "@/components/icons";
import { respondToIncomingLikeAction } from "@/lib/actions/discoverActions";

export function IncomingLikesList({ locale, likers }) {
  const t = useI18n();
  const [processed, setProcessed] = useState(new Set());
  const [error, setError] = useState(null);
  const [matchedProfile, setMatchedProfile] = useState(null);

  async function handleRespond(fromUserId, action, profile) {
    setError(null);
    const result = await respondToIncomingLikeAction(fromUserId, action);
    if (result.status === "error") {
      setError(t(`discover.errors.${result.message}`));
      return;
    }
    setProcessed((prev) => new Set(prev).add(fromUserId));
    if (result.data?.matched) setMatchedProfile(profile);
  }

  const remaining = likers.filter(({ swipe }) => !processed.has(swipe.fromUser));

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {remaining.length === 0 ? (
        <EmptyState title={t("likes.emptyTitle")} description={t("likes.emptyBody")} />
      ) : (
        remaining.map(({ swipe, profile }, index) => (
          <SectionCard
            key={swipe.fromUser}
            className="flex animate-list-in items-center gap-3"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            {/* Avatar ve isim tek bir dokunma hedefi: ayrı ayrı linklendiğinde
                ikisi de 44px'in altında kalıyordu. */}
            <Link
              href={`/${locale}/u/${profile.id}`}
              className="flex min-h-11 min-w-0 flex-1 items-center gap-3 font-semibold text-foreground transition-colors hover:text-primary"
            >
              <Avatar src={profile.avatarUrl} name={profile.name} size="sm" />
              <span className="min-w-0 truncate">{profile.name}</span>
            </Link>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                aria-label={t("likes.reject")}
                onClick={() => handleRespond(profile.id, "dislike", profile)}
                className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-soft transition-transform hover:text-destructive active:scale-95"
              >
                <CloseIcon className="size-5" />
              </button>
              <button
                type="button"
                aria-label={t("likes.accept")}
                onClick={() => handleRespond(profile.id, "like", profile)}
                className="flex size-11 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-card transition-transform active:scale-95"
              >
                <HeartIcon className="size-5" />
              </button>
            </div>
          </SectionCard>
        ))
      )}

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
    </div>
  );
}
