"use client";

import { useEffect, useState } from "react";
import { fetchUnreadNotificationCountAction } from "@/lib/actions/notificationActions";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { useNavItems } from "./navItems";

const UNREAD_POLL_INTERVAL_MS = 8000;

/**
 * Mobil öncelikli uygulama kabuğu (plan bölüm 6 + 7):
 * - mobil: sticky header + içerik + sabit alt navigasyon + `/menu` sayfası
 * - `lg:` ve üstü: sol sabit sidebar, alt bar ve header gizlenir
 *
 * İçerik alanının alt boşluğu alt barın yüksekliği (4rem) + cihazın
 * safe-area değeri kadardır; aksi halde son satır alt barın altında kalır.
 *
 * "Menü" eskiden burada açılan bir tam ekran Dialog'du; artık gerçek bir
 * rota (`/menu`) — tarayıcı geri tuşunun dialog yerine bir önceki sayfaya
 * dönmesi gerektiği için (bkz. BottomNav.js).
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
  const { primary, secondary } = useNavItems({ locale, isAuthenticated, isAdmin });

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

      <BottomNav locale={locale} items={primary} />
    </div>
  );
}
