"use client";

import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { AppMenu } from "./AppMenu";
import { useNavItems } from "./navItems";

/**
 * Mobil öncelikli uygulama kabuğu (plan bölüm 6 + 7):
 * - mobil: sticky header + içerik + sabit alt navigasyon + tam ekran menü
 * - `lg:` ve üstü: sol sabit sidebar, alt bar ve header gizlenir
 *
 * İçerik alanının alt boşluğu alt barın yüksekliği (4rem) + cihazın
 * safe-area değeri kadardır; aksi halde son satır alt barın altında kalır.
 */
export function AppShell({ locale, isAuthenticated, isAdmin, coinBalance, avatarUrl, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { primary, secondary } = useNavItems({ locale, isAuthenticated, isAdmin });

  return (
    <div className="min-h-dvh bg-background lg:pl-64">
      <Sidebar
        locale={locale}
        items={primary}
        secondaryItems={secondary}
        isAuthenticated={isAuthenticated}
        coinBalance={coinBalance}
      />

      <AppHeader
        locale={locale}
        isAuthenticated={isAuthenticated}
        coinBalance={coinBalance}
        avatarUrl={avatarUrl}
      />

      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</div>

      <BottomNav items={primary} onOpenMenu={() => setMenuOpen(true)} />

      <AppMenu
        locale={locale}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        items={secondary}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
