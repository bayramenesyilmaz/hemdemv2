"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { approveTestAction, rejectTestAction } from "@/lib/actions/adminActions";

export function AdminPendingTestsList({ locale, initialTests }) {
  const t = useI18n();
  const [tests, setTests] = useState(initialTests);
  const [pendingId, setPendingId] = useState(null);

  async function handleApprove(testId) {
    setPendingId(testId);
    await approveTestAction(testId);
    setPendingId(null);
    setTests((prev) => prev.filter((test) => test.id !== testId));
  }

  async function handleReject(testId) {
    setPendingId(testId);
    await rejectTestAction(testId);
    setPendingId(null);
    setTests((prev) => prev.filter((test) => test.id !== testId));
  }

  if (tests.length === 0) {
    return <EmptyState title={t("admin.pendingTestsEmptyTitle")} description={t("admin.pendingTestsEmptyBody")} />;
  }

  return (
    <div className="flex flex-col gap-2">
      {tests.map((test) => (
        <SectionCard key={test.id} className="flex items-center justify-between gap-4">
          <Link href={`/${locale}/tests/${test.id}`} className="font-medium text-foreground underline">
            {test.title}
          </Link>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="delete" disabled={pendingId === test.id}>
                  {t("admin.reject")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>{t("tests.deleteConfirmTitle")}</DialogTitle>
                <DialogDescription>{t("tests.deleteConfirmBody")}</DialogDescription>
                <div className="mt-4 flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      {t("profile.cancel")}
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    variant="delete"
                    loading={pendingId === test.id}
                    onClick={() => handleReject(test.id)}
                  >
                    {t("tests.deleteConfirmAction")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              type="button"
              variant="confirm"
              loading={pendingId === test.id}
              onClick={() => handleApprove(test.id)}
            >
              {t("admin.approve")}
            </Button>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
