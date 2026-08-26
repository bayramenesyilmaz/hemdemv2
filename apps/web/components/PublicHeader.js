import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

/**
 * Uygulama kabuğunun dışında kalan sayfaların (karşılama, giriş, kayıt,
 * şifre sıfırlama, onboarding) üst çubuğu. Dil değiştirici burada da
 * bulunmalı: crawler'ların iki dil sürümünü de keşfetmesi buna bağlı
 * (bkz. LocaleSwitcher'daki not).
 */
export function PublicHeader({ locale }) {
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <Link href={`/${locale}`} className="text-xl font-extrabold tracking-tight text-foreground">
        Hemdem<span className="text-primary">.</span>
      </Link>
      <LocaleSwitcher />
    </header>
  );
}
