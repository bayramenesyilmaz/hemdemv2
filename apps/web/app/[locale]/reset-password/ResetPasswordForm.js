"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InfoBanner } from "@/components/InfoBanner";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export function ResetPasswordForm({ locale }) {
  const t = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (USE_MOCK_DATA) {
    return <InfoBanner>{t("auth.mockModeNotice")}</InfoBanner>;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push(`/${locale}/login`), 2000);
  }

  if (success) {
    return <InfoBanner>{t("auth.resetPassword.success")}</InfoBanner>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-muted-foreground">
          {t("auth.resetPassword.newPasswordLabel")}
        </label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="confirm" loading={loading}>
        {t("auth.resetPassword.submit")}
      </Button>
    </form>
  );
}
