"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/locales/client";
import { LogoutButton } from "@/components/LogoutButton";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { CoinIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Brand } from "./Brand";
import { isActivePath } from "./navItems";

/**
 * Masaüstü sol sabit sidebar (plan bölüm 6). Mobilde tamamen gizlidir;
 * oradaki karşılığı BottomNav + tam ekran menüdür.
 */
function NavList({ items, pathname }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map(({ href, label, Icon }) => {
        const active = isActivePath(pathname, href);
        return (
          <li key={`${href}-${label}`}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar({ locale, items, secondaryItems, isAuthenticated, coinBalance }) {
  const t = useI18n();
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
      <Brand locale={locale} />

      {/*
        Masaüstünde alt navigasyon ve tam ekran menü yoktur; bu yüzden
        mobilde menüye giden ikincil rotalar burada ikinci bir grup olarak
        listelenir — aksi halde masaüstünde erişilemez kalırlardı.
      */}
      <nav aria-label={t("nav.primaryNavLabel")} className="mt-8 flex-1 overflow-y-auto">
        <NavList items={items} pathname={pathname} />

        {secondaryItems.length > 0 && (
          <>
            <hr className="my-4 border-border" />
            <NavList items={secondaryItems} pathname={pathname} />
          </>
        )}
      </nav>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        {isAuthenticated ? (
          <>
            <Link
              href={`/${locale}/coins`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <CoinIcon className="h-5 w-5" />
              {t("coins.balanceLabel", { balance: coinBalance })}
            </Link>
            <LogoutButton locale={locale} />
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Button href={`/${locale}/register`} variant="confirm">
              {t("home.ctaRegister")}
            </Button>
            <Button href={`/${locale}/login`} variant="outline">
              {t("home.ctaLogin")}
            </Button>
          </div>
        )}
        <LocaleSwitcher />
      </div>
    </aside>
  );
}
