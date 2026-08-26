"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { deleteOwnTestAction } from "@/lib/actions/testActions";

export function MyTestsList({ locale, tests }) {
  const t = useI18n();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(testId) {
    setDeletingId(testId);
    await deleteOwnTestAction(testId);
    router.refresh();
  }

  if (tests.length === 0) {
    return <EmptyState title={t("tests.mineEmptyTitle")} description={t("tests.mineEmptyBody")} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {tests.map((test) => (
        <SectionCard key={test.id} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/tests/${test.id}`} className="font-medium text-foreground underline">
              {test.title}
            </Link>
            {!test.approved && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {t("tests.pendingApproval")}
              </span>
            )}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="delete" disabled={deletingId === test.id}>
                {t("tests.delete")}
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
                <Button type="button" variant="delete" onClick={() => handleDelete(test.id)}>
                  {t("tests.deleteConfirmAction")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </SectionCard>
      ))}
    </div>
  );
}
