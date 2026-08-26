"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { mockSignOutAction } from "@/lib/actions/mockAuthActions";
import { Button } from "@/components/ui/Button";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export function LogoutButton({ locale }) {
  const t = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    if (USE_MOCK_DATA) {
      await mockSignOutAction();
    } else {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick} disabled={loading}>
      {t("nav.logout")}
    </Button>
  );
}
