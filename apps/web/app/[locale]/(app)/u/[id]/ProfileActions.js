"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";
import { HeartIcon } from "@/components/icons";
import { swipeAction } from "@/lib/actions/discoverActions";

const GATE_TEST_ERRORS = new Set(["gate_test_not_completed", "gate_test_threshold_not_met"]);

/**
 * Doğrudan bir profile gidildiğinde (keşfet destesinin dışında) de
 * beğenilebilsin diye — keşfetteki aynı `swipeAction`'ı burada tek bir
 * hedefe karşı çağırıyoruz. "Geç" (dislike) burada yok: kullanıcı zaten
 * bilinçli olarak bu profile girmiş, keşfet destesindeki gibi hızlı
 * eleme mantığı bu bağlamda anlamsız.
 */
export function ProfileActions({ locale, profileId, profileName }) {
  const t = useI18n();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [matched, setMatched] = useState(false);

  async function handleLike() {
    setPending(true);
    setError(null);
    const result = await swipeAction(profileId, "like");
    setPending(false);

    if (result.status === "error") {
      setError(GATE_TEST_ERRORS.has(result.message) ? t(`discover.errors.${result.message}`) : result.message);
      return;
    }

    if (result.data.matched) {
      setMatched(true);
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleLike}
        disabled={pending}
        aria-label={t("discover.like")}
        className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-transform active:scale-95 disabled:pointer-events-none disabled:opacity-60"
      >
        <HeartIcon className="size-5" />
      </button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Dialog open={matched} onOpenChange={(open) => !open && setMatched(false)}>
        <DialogContent>
          <DialogTitle>{t("discover.matchTitle")}</DialogTitle>
          <DialogDescription>{t("discover.matchBody", { name: profileName })}</DialogDescription>
          <div className="mt-4 flex justify-end">
            <Button type="button" variant="confirm" onClick={() => setMatched(false)}>
              {t("discover.keepSwiping")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
