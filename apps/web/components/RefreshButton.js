"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { RefreshIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

/**
 * Sayfa geçişlerinde her seferinde otomatik yeniden istek atmak yerine
 * (bu bir sunucu bileşeni olduğu için Next.js zaten böyle çalışıyor),
 * kullanıcının "en güncel hâli görmek istediğinde" kendi isteğiyle
 * tetiklediği bir yenileme — çoğu uygulamadaki "aşağı çek/yenile"
 * butonunun daha basit ve güvenilir bir karşılığı. `router.refresh()`
 * sadece geçerli rotanın sunucu verisini tazeler, tam sayfa yenilemesi
 * yapmaz.
 */
export function RefreshButton({ className }) {
  const t = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      aria-label={t("nav.refreshLabel")}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60",
        className
      )}
    >
      <RefreshIcon className={cn("h-5 w-5", isPending && "animate-spin")} />
    </button>
  );
}
