"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/locales/client";
import { MenuIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { isActivePath } from "./navItems";

/**
 * Mobil alt navigasyon (plan bölüm 6). `env(safe-area-inset-bottom)` ile
 * iPhone'daki home indicator çubuğunun altında kalmaz; PWA standalone
 * modda da doğru boşluğu bırakır.
 *
 * "Menü" artık bir dialog açmıyor, gerçek bir sayfaya (`/menu`) gidiyor:
 * dialog iken tarayıcı geri tuşu menüyü kapatmak yerine altındaki
 * sayfadan geri gidiyordu — gerçek bir rota olunca geri tuşu doğru
 * şekilde bir önceki sayfaya (menüyü kapatarak) döner.
 */
export function BottomNav({ locale, items, unreadMessageCount = 0 }) {
  const t = useI18n();
  const pathname = usePathname();
  const menuHref = `/${locale}/menu`;
  const menuActive = isActivePath(pathname, menuHref);

  return (
    <nav
      aria-label={t("nav.primaryNavLabel")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {items.map(({ href, label, shortLabel, Icon }) => {
          const active = isActivePath(pathname, href);
          const isMessages = href.endsWith("/messages");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground active:text-foreground"
                )}
              >
                <span className="relative">
                  <Icon className={cn("h-6 w-6 shrink-0", active && "scale-110 transition-transform")} />
                  {isMessages && unreadMessageCount > 0 && (
                    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                    </span>
                  )}
                </span>
                <span className="w-full truncate px-1 text-center leading-none">
                  {shortLabel ?? label}
                </span>
              </Link>
            </li>
          );
        })}

        <li className="flex-1">
          <Link
            href={menuHref}
            aria-current={menuActive ? "page" : undefined}
            aria-label={t("nav.menu")}
            className={cn(
              "flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
              menuActive ? "text-primary" : "text-muted-foreground active:text-foreground"
            )}
          >
            <MenuIcon className={cn("h-6 w-6", menuActive && "scale-110 transition-transform")} />
            <span className="leading-none">{t("nav.menu")}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
