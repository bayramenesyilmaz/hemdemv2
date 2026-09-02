"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { PageTitle } from "@/components/PageTitle";
import { LogoutButton } from "@/components/LogoutButton";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/icons";
import { useNavItems } from "@/components/nav/navItems";

/**
 * Alt bara sığmayan tüm ikincil rotaların listelendiği menü — artık
 * `AppMenu.js`'deki gibi bir Dialog değil, gerçek bir sayfa (`/menu`):
 * dialog iken tarayıcı geri tuşu menüyü kapatmak yerine altındaki
 * sayfadan geri gidiyordu (bkz. BottomNav.js'teki not). Kapatma butonu
 * da aynı sebeple `router.back()` kullanıyor.
 */
export function MenuPageContent({ locale, isAuthenticated, isAdmin }) {
  const t = useI18n();
  const router = useRouter();
  const { secondary } = useNavItems({ locale, isAuthenticated, isAdmin });

  return (
    <>
      <PageTitle
        action={
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={t("nav.closeMenu")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        }
      >
        {t("nav.menu")}
      </PageTitle>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {secondary.map(({ href, label, Icon }) => (
          <li key={`${href}-${label}`}>
            <Link
              href={href}
              className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-2 text-center text-sm font-medium text-foreground active:bg-muted"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="line-clamp-2 leading-tight">{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        {isAuthenticated ? (
          <LogoutButton locale={locale} />
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
        <div className="flex justify-center gap-4">
          <LocaleSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </>
  );
}
