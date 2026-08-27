"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { mockSignOutAction } from "@/lib/actions/mockAuthActions";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { LogoutIcon } from "@/components/icons";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/**
 * Menüdeki "kapat" (X) butonuyla karıştırılıp yanlışlıkla çıkış
 * yapılmaması için: buton görsel olarak belirgin şekilde yıkıcı
 * (destructive kırmızı) ve tek dokunuşla değil, onay istedikten sonra
 * çalışıyor.
 */
export function LogoutButton({ locale }) {
  const t = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
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
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="delete" className="gap-2">
          <LogoutIcon className="size-4" />
          {t("nav.logout")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t("nav.logoutConfirmTitle")}</DialogTitle>
        <div className="mt-4 flex justify-end gap-3">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("profile.cancel")}
            </Button>
          </DialogClose>
          <Button type="button" variant="delete" loading={loading} onClick={handleConfirm}>
            {t("nav.logoutConfirmAction")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
