"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { CoinIcon, UserIcon } from "@/components/icons";
import { Brand } from "./Brand";

/**
 * Mobil üst header (plan bölüm 6). Masaüstünde sidebar aynı bilgiyi
 * taşıdığı için `lg:hidden`. `sticky` + `backdrop-blur` ile içerik
 * kayarken marka ve hızlı aksiyonlar erişilebilir kalır.
 */
export function AppHeader({ locale, isAuthenticated, coinBalance, avatarUrl }) {
  const t = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Brand locale={locale} />

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                href={`/${locale}/coins`}
                aria-label={t("coins.balanceLabel", { balance: coinBalance })}
                className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1.5 text-sm font-semibold text-foreground"
              >
                <CoinIcon className="h-4 w-4 text-primary" />
                {coinBalance}
              </Link>

              <Link
                href={`/${locale}/profile`}
                aria-label={t("nav.profile")}
                className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt=""
                    fill
                    unoptimized={avatarUrl.startsWith("data:")}
                    className="object-cover"
                  />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                href={`/${locale}/login`}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground"
              >
                {t("home.ctaLogin")}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
              >
                {t("home.ctaRegister")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
