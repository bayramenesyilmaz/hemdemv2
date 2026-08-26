"use client";

import Link from "next/link";
import { useI18n } from "@/locales/client";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { LogoutButton } from "@/components/LogoutButton";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/icons";

/**
 * Plan bölüm 6'daki "sağ üst tam ekran menü": alt bara sığmayan tüm
 * ikincil rotalar burada toplanır. Bir link'e tıklanınca menü kapanır —
 * bu yüzden her satır `DialogClose asChild` ile sarılıdır.
 */
export function AppMenu({ locale, open, onOpenChange, items, isAuthenticated }) {
  const t = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="full" className="p-0">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <DialogTitle className="text-lg font-semibold">{t("nav.menu")}</DialogTitle>
          <DialogClose
            aria-label={t("nav.closeMenu")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
          >
            <CloseIcon className="h-6 w-6" />
          </DialogClose>
        </div>

        <div className="flex-1 px-4 py-4">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map(({ href, label, Icon }) => (
              <li key={`${href}-${label}`}>
                <DialogClose asChild>
                  <Link
                    href={href}
                    className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-2 text-center text-sm font-medium text-foreground active:bg-muted"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                    <span className="line-clamp-2 leading-tight">{label}</span>
                  </Link>
                </DialogClose>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-border px-4 py-4">
          {isAuthenticated ? (
            <LogoutButton locale={locale} />
          ) : (
            <div className="flex flex-col gap-2">
              <DialogClose asChild>
                <Button href={`/${locale}/register`} variant="confirm">
                  {t("home.ctaRegister")}
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button href={`/${locale}/login`} variant="outline">
                  {t("home.ctaLogin")}
                </Button>
              </DialogClose>
            </div>
          )}
          <div className="flex justify-center">
            <LocaleSwitcher />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
