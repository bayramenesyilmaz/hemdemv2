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
 */
export function BottomNav({ items, onOpenMenu }) {
  const t = useI18n();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("nav.primaryNavLabel")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {items.map(({ href, label, shortLabel, Icon }) => {
          const active = isActivePath(pathname, href);
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
                <Icon className={cn("h-6 w-6 shrink-0", active && "scale-110 transition-transform")} />
                <span className="w-full truncate px-1 text-center leading-none">
                  {shortLabel ?? label}
                </span>
              </Link>
            </li>
          );
        })}

        <li className="flex-1">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label={t("nav.menu")}
            className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors active:text-foreground"
          >
            <MenuIcon className="h-6 w-6" />
            <span className="leading-none">{t("nav.menu")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
