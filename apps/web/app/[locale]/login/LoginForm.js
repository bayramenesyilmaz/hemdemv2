"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { getPostLoginDestinationAction } from "@/lib/actions/authActions";
import { mockSignInAction } from "@/lib/actions/mockAuthActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export function LoginForm({ locale }) {
  const t = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (USE_MOCK_DATA) {
      const signInResult = await mockSignInAction({ email, password });
      if (signInResult.status === "error") {
        setError(signInResult.message);
        setLoading(false);
        return;
      }
    } else {
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }

    const destination = await getPostLoginDestinationAction();
    if (destination.status === "error") {
      setError(t("auth.login.errorGeneric"));
      setLoading(false);
      return;
    }

    router.push(`/${locale}/${destination.data.next}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-muted-foreground">
          {t("auth.emailLabel")}
        </label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-muted-foreground">
          {t("auth.passwordLabel")}
        </label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="confirm" disabled={loading}>
        {t("auth.login.submit")}
      </Button>

      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${locale}/forgot-password`} className="underline">
          {t("auth.login.forgotPasswordLink")}
        </Link>
        <p>
          {t("auth.login.noAccount")}{" "}
          <Link href={`/${locale}/register`} className="font-medium text-foreground underline">
            {t("auth.login.registerLink")}
          </Link>
        </p>
      </div>
    </form>
  );
}
