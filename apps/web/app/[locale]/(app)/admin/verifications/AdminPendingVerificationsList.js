"use client";

import { useState } from "react";
import Image from "next/image";
import { useI18n } from "@/locales/client";
import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";
import { approveVerificationAction, rejectVerificationAction } from "@/lib/actions/adminActions";

export function AdminPendingVerificationsList({ initialProfiles }) {
  const t = useI18n();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [pendingId, setPendingId] = useState(null);

  async function handleApprove(userId) {
    setPendingId(userId);
    await approveVerificationAction(userId);
    setPendingId(null);
    setProfiles((prev) => prev.filter((profile) => profile.id !== userId));
  }

  async function handleReject(userId) {
    setPendingId(userId);
    await rejectVerificationAction(userId);
    setPendingId(null);
    setProfiles((prev) => prev.filter((profile) => profile.id !== userId));
  }

  if (profiles.length === 0) {
    return (
      <EmptyState
        title={t("admin.pendingVerificationsEmptyTitle")}
        description={t("admin.pendingVerificationsEmptyBody")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {profiles.map((profile) => (
        <SectionCard key={profile.id} className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {profile.verificationPhotoUrl && (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={profile.verificationPhotoUrl}
                  alt=""
                  fill
                  unoptimized={profile.verificationPhotoUrl.startsWith("data:")}
                  className="object-cover"
                  sizes="56px"
                />
              </div>
            )}
            <p className="truncate font-medium text-foreground">{profile.name}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="delete"
              disabled={pendingId === profile.id}
              onClick={() => handleReject(profile.id)}
            >
              {t("admin.reject")}
            </Button>
            <Button
              type="button"
              variant="confirm"
              loading={pendingId === profile.id}
              onClick={() => handleApprove(profile.id)}
            >
              {t("admin.approve")}
            </Button>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
