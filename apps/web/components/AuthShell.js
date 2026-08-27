import { PublicHeader } from "@/components/PublicHeader";

/**
 * Giriş/kayıt/şifre/onboarding sayfalarının ortak kabuğu: üstte marka +
 * dil değiştirici, ortada dikey olarak ortalanmış dar bir form kolonu.
 * `min-h-dvh` mobil tarayıcılarda adres çubuğu görünüp kaybolurken
 * zıplamayı önler (`vh` yerine).
 */
export function AuthShell({ locale, title, children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PublicHeader locale={locale} />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {children}
      </main>
    </div>
  );
}
