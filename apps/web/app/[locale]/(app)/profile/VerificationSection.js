"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/locales/client";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";
import { InfoBanner } from "@/components/InfoBanner";
import { ShieldIcon } from "@/components/icons";
import { submitVerificationPhotoAction } from "@/lib/actions/profileActions";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * "capture" özelliği çoğu mobil tarayıcıda doğrudan ön kamerayı açar —
 * masaüstünde tarayıcı bunu yok sayıp normal dosya seçiciye düşer (gerçek
 * bir zorlama değil, sadece bir ipucu). Asıl güven garantisi admin
 * panelinden gelen insan onayı — bkz. Faz 6 planı.
 */
export function VerificationSection({ initialStatus }) {
  const t = useI18n();
  const [status, setStatus] = useState(initialStatus ?? "none");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  async function handleCapture(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t("profile.avatarInvalidType"));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(t("profile.avatarTooLarge"));
      return;
    }

    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set("photo", file);
    const result = await submitVerificationPhotoAction(formData);
    setUploading(false);

    if (result.status === "error") {
      setError(
        result.message === "verification_already_submitted"
          ? t("profile.verifyErrorAlreadySubmitted")
          : result.message === "file_too_large"
            ? t("profile.avatarTooLarge")
            : t("profile.avatarInvalidType")
      );
      return;
    }
    setStatus("pending");
  }

  if (status === "approved") {
    return null;
  }

  return (
    <SectionCard className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShieldIcon className="size-5 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">{t("profile.verifyTitle")}</h2>
      </div>

      {status === "pending" ? (
        <InfoBanner>{t("profile.verifyPendingNotice")}</InfoBanner>
      ) : (
        <>
          {status === "rejected" && <InfoBanner>{t("profile.verifyRejectedNotice")}</InfoBanner>}
          <p className="text-sm text-muted-foreground">{t("profile.verifyExplainer")}</p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="button"
            variant="outline"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
            className="self-start"
          >
            {uploading ? t("profile.verifyUploading") : t("profile.verifyCta")}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            onChange={handleCapture}
            disabled={uploading}
          />
        </>
      )}
    </SectionCard>
  );
}
