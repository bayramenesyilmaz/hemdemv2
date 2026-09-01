"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { blockUserAction, reportUserAction } from "@/lib/actions/safetyActions";

/**
 * Engelle + şikayet et — App Store'un UGC/kullanıcı-kullanıcı iletişimi
 * olan app'ler için zorunlu tuttuğu (Guideline 1.2) güvenlik akışı.
 * Sade metin linkleri olarak sunuluyor, ana aksiyon butonlarıyla (beğen/
 * mesaj) görsel ağırlıkta yarışmasın diye.
 */
export function SafetyMenu({ targetUserId, targetName, onBlocked }) {
  const t = useI18n();
  const router = useRouter();
  const [blockOpen, setBlockOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [blockError, setBlockError] = useState(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  async function handleBlock() {
    setBlocking(true);
    setBlockError(null);
    const result = await blockUserAction(targetUserId);
    setBlocking(false);
    if (result.status === "error") {
      setBlockError(t(`safety.errors.${result.message}`));
      return;
    }
    setBlockOpen(false);
    if (onBlocked) onBlocked();
    else router.refresh();
  }

  async function handleReport(event) {
    event.preventDefault();
    setReporting(true);
    setReportError(null);
    const result = await reportUserAction(targetUserId, { subject, description });
    setReporting(false);
    if (result.status === "error") {
      setReportError(t(`safety.errors.${result.message}`));
      return;
    }
    setReportSuccess(true);
    setSubject("");
    setDescription("");
  }

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogTrigger asChild>
          <button type="button" className="underline-offset-2 hover:text-foreground hover:underline">
            {t("safety.block")}
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{t("safety.blockConfirmTitle", { name: targetName })}</DialogTitle>
          <DialogDescription>{t("safety.blockConfirmBody")}</DialogDescription>
          {blockError && <p className="mt-2 text-sm text-destructive">{blockError}</p>}
          <div className="mt-4 flex justify-end gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("safety.cancel")}
              </Button>
            </DialogClose>
            <Button type="button" variant="delete" loading={blocking} onClick={handleBlock}>
              {t("safety.blockConfirmAction")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={reportOpen}
        onOpenChange={(open) => {
          setReportOpen(open);
          if (!open) setReportSuccess(false);
        }}
      >
        <DialogTrigger asChild>
          <button type="button" className="underline-offset-2 hover:text-foreground hover:underline">
            {t("safety.report")}
          </button>
        </DialogTrigger>
        <DialogContent>
          {reportSuccess ? (
            <p className="text-sm text-foreground">{t("safety.reportSuccess")}</p>
          ) : (
            <form onSubmit={handleReport} className="flex flex-col gap-4">
              <DialogTitle>{t("safety.reportTitle", { name: targetName })}</DialogTitle>
              <div className="flex flex-col gap-1">
                <label htmlFor="report-subject" className="text-sm text-muted-foreground">
                  {t("safety.reportSubjectLabel")}
                </label>
                <Input id="report-subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="report-description" className="text-sm text-muted-foreground">
                  {t("safety.reportDescriptionLabel")}
                </label>
                <Textarea
                  id="report-description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              {reportError && <p className="text-sm text-destructive">{reportError}</p>}
              <Button type="submit" variant="delete" loading={reporting} className="self-end">
                {t("safety.reportSubmit")}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
