"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { registerProfileAction } from "@/lib/actions/authActions";

export function RegisterForm({ locale }) {
  const t = useI18n();
  const router = useRouter();
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

    const supabase = getSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError(t("auth.register.errorGeneric"));
      setLoading(false);
      return;
    }

    const result = await registerProfileAction({ id: userId, name, language: locale });
    if (result.status === "error" && result.message !== "profile_already_exists") {
      setError(result.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push(`/${locale}/onboarding`);
      return;
    }

    setConfirmEmailNotice(true);
    setLoading(false);
  }

  if (confirmEmailNotice) {
    return (
      <p className="max-w-sm text-center text-muted-foreground">
        {t("auth.register.confirmEmailNotice")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm text-muted-foreground">
          {t("auth.nameLabel")}
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-muted-foreground">
          {t("auth.emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-muted-foreground">
          {t("auth.passwordLabel")}
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground disabled:opacity-60"
      >
        {t("auth.register.submit")}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.register.hasAccount")}{" "}
        <Link href={`/${locale}/login`} className="font-medium text-foreground underline">
          {t("auth.register.loginLink")}
        </Link>
      </p>
    </form>
  );
}
