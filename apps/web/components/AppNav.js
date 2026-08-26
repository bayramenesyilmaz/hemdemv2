"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/locales/client";
import { LogoutButton } from "@/components/LogoutButton";
import { cn } from "@/lib/cn";

/**
 * Uygulama sayfaları arasında paylaşılan üst navigasyon.
 */
export function AppNav({ locale, isAuthenticated, coinBalance, isAdmin }) {
  const t = useI18n();
  const pathname = usePathname();

  const links = [
    { href: `/${locale}/discover`, label: t("nav.discover") },
    { href: `/${locale}/tests`, label: t("nav.tests") },
    { href: `/${locale}/posts`, label: t("nav.posts") },
    { href: `/${locale}/leaderboard`, label: t("nav.leaderboard") },
    ...(isAuthenticated
      ? [
          { href: `/${locale}/likes`, label: t("nav.likes") },
          { href: `/${locale}/messages`, label: t("nav.messages") },
          { href: `/${locale}/notes`, label: t("nav.notes") },
        ]
      : []),
    { href: `/${locale}/help`, label: t("nav.help") },
    ...(isAdmin ? [{ href: `/${locale}/admin`, label: t("nav.admin") }] : []),
  ];

  return (
    <nav className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
      <div className="flex items-center gap-4 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "font-medium",
              pathname === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3 text-sm">
        {isAuthenticated ? (
          <>
            <Link
              href={`/${locale}/coins`}
              className={cn(
                "font-medium",
                pathname === `/${locale}/coins` ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🪙 {coinBalance}
            </Link>
            <Link
              href={`/${locale}/profile`}
              className={cn(
                "font-medium",
                pathname.startsWith(`/${locale}/profile`)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("nav.profile")}
            </Link>
            <LogoutButton locale={locale} />
          </>
        ) : (
          <>
            <Link href={`/${locale}/login`} className="font-medium text-muted-foreground hover:text-foreground">
              {t("home.ctaLogin")}
            </Link>
            <Link href={`/${locale}/register`} className="font-medium text-foreground underline">
              {t("home.ctaRegister")}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
