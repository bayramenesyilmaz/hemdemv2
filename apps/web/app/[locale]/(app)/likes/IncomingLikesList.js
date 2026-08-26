"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";
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
        remaining.map(({ swipe, profile }) => (
          <SectionCard key={swipe.fromUser} className="flex items-center justify-between gap-4">
            <Link href={`/${locale}/u/${profile.id}`} className="font-medium text-foreground underline">
              {profile.name}
            </Link>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => handleRespond(profile.id, "dislike", profile)}>
                {t("likes.reject")}
              </Button>
              <Button type="button" variant="confirm" onClick={() => handleRespond(profile.id, "like", profile)}>
                {t("likes.accept")}
              </Button>
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
