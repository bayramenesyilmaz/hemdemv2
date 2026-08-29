"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchUnreadNotificationCountAction } from "@/lib/actions/notificationActions";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { AppMenu } from "./AppMenu";
import { useNavItems } from "./navItems";

const UNREAD_POLL_INTERVAL_MS = 8000;

/**
 * Mobil öncelikli uygulama kabuğu (plan bölüm 6 + 7):
 * - mobil: sticky header + içerik + sabit alt navigasyon + tam ekran menü
 * - `lg:` ve üstü: sol sabit sidebar, alt bar ve header gizlenir
 *
 * İçerik alanının alt boşluğu alt barın yüksekliği (4rem) + cihazın
 * safe-area değeri kadardır; aksi halde son satır alt barın altında kalır.
 */
export function AppShell({
  locale,
  isAuthenticated,
  isAdmin,
  coinBalance,
  avatarUrl,
  unreadCount = 0,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { primary, secondary } = useNavItems({ locale, isAuthenticated, isAdmin });
  const pathname = usePathname();

  // Tek bir sondaj (polling) döngüsü hem mobil header'daki zil rozetini
  // hem de masaüstü sidebar'daki "Bildirimler" rozetini besliyor —
  // ikisi ayrı ayrı sondaj yapsaydı her 8 saniyede iki katı istek atardı.
  const [liveUnreadCount, setLiveUnreadCount] = useState(unreadCount);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(async () => {
      const count = await fetchUnreadNotificationCountAction();
      setLiveUnreadCount(count);
    }, UNREAD_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // AppShell sayfalar arasında hiç unmount olmaz (sadece `children`
  // değişir), bu yüzden menü açıkken geri tuşuna basılınca URL/sayfa
  // değişir ama `menuOpen` state'i hayatta kalır ve menü yeni sayfanın
  // üzerinde açık görünmeye devam ederdi. React'in önerdiği "render
  // sırasında state ayarlama" deseniyle (useEffect yerine) rota
  // değiştiğinde kapatılır — bu ekstra bir render turu eklemez.
  const [renderedPathname, setRenderedPathname] = useState(pathname);
  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <div className="min-h-dvh bg-background lg:pl-64">
      <Sidebar
        locale={locale}
        items={primary}
        secondaryItems={secondary}
        isAuthenticated={isAuthenticated}
        coinBalance={coinBalance}
        unreadCount={liveUnreadCount}
      />

      <AppHeader
        locale={locale}
        isAuthenticated={isAuthenticated}
        coinBalance={coinBalance}
        avatarUrl={avatarUrl}
        unreadCount={liveUnreadCount}
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
