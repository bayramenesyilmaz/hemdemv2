"use client";

import { useState } from "react";
import { useI18n } from "@/locales/client";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InfoBanner } from "@/components/InfoBanner";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export function ForgotPasswordForm({ locale }) {
  const t = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  if (USE_MOCK_DATA) {
    return <InfoBanner>{t("auth.mockModeNotice")}</InfoBanner>;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const domain = process.env.NEXT_PUBLIC_DOMAIN ?? window.location.origin;
    const supabase = getSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${domain}/${locale}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return <InfoBanner>{t("auth.forgotPassword.success")}</InfoBanner>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-muted-foreground">
          {t("auth.emailLabel")}
        </label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="confirm" disabled={loading}>
        {t("auth.forgotPassword.submit")}
      </Button>
    </form>
  );
}
