"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

export function LogoutButton({ locale }) {
  const t = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground disabled:opacity-60"
    >
      {t("nav.logout")}
    </button>
  );
}
