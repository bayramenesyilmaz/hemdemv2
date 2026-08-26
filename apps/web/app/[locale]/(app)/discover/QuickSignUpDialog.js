"use client";

import { useState } from "react";
import { useI18n } from "@/locales/client";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { mockSignUpAction } from "@/lib/actions/mockAuthActions";
import { guestLikeAction } from "@/lib/actions/discoverActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/**
 * `allow_guest_likes=true` olan bir profile misafir olarak beğeni
 * gönderilmek istendiğinde açılır: hızlı kayıt (isim + e-posta/şifre)
 * tamamlanınca beğeni otomatik gönderilir.
 */
export function QuickSignUpDialog({ locale, target, onClose, onSuccess }) {
  const t = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmEmailNotice, setConfirmEmailNotice] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    let userId;

    if (USE_MOCK_DATA) {
      const result = await mockSignUpAction({ email, password, name, language: locale });
      if (result.status === "error") {
        setError(result.message);
        setLoading(false);
        return;
      }
      userId = result.data.userId;
    } else {
      const supabase = getSupabaseBrowserClient();
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (!data.session) {
        setConfirmEmailNotice(true);
        setLoading(false);
        return;
      }
      userId = data.user.id;
    }

    const likeResult = await guestLikeAction({ id: userId, name, language: locale }, target.id);
    if (likeResult.status === "error" && likeResult.message !== "profile_already_exists") {
      setError(likeResult.message);
      setLoading(false);
      return;
    }

    onSuccess();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogTitle>{t("discover.quickSignUpTitle", { name: target.name })}</DialogTitle>
        <DialogDescription>{t("discover.quickSignUpBody")}</DialogDescription>

        {confirmEmailNotice ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("auth.register.confirmEmailNotice")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <Input
              placeholder={t("auth.nameLabel")}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="email"
              placeholder={t("auth.emailLabel")}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder={t("auth.passwordLabel")}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="mt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("profile.cancel")}
              </Button>
              <Button type="submit" variant="confirm" disabled={loading}>
                {t("discover.quickSignUpSubmit")}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
