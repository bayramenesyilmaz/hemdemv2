"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { fetchUnreadSummaryAction } from "@/lib/actions/notificationActions";
import { touchLastSeenAction } from "@/lib/actions/profileActions";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { useNavItems } from "./navItems";

// Mesajların "akıcı" hissetmesi için kısa tutuluyor — bu projede RLS
// politikası olmadığından Supabase Realtime'a client'tan abone
// olunamıyor (bkz. ChatThread.js), sondaj (polling) tek seçenek.
const UNREAD_POLL_INTERVAL_MS = 5000;

// Çevrimiçi durumu 3 dakikalık bir eşikle türetildiği için (bkz.
// isOnline, packages/core/domain/entities/user.js) yazma sıklığı bundan
// çok daha seyrek tutulabilir — 60sn'de bir yeterli.
const HEARTBEAT_INTERVAL_MS = 60000;

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
  unreadMessageCount = 0,
  children,
}) {
  const t = useI18n();
  const pathname = usePathname();
  const { primary, secondary } = useNavItems({ locale, isAuthenticated, isAdmin });

  // Tek bir sondaj (polling) döngüsü hem mobil header'daki zil rozetini
  // hem masaüstü sidebar'daki rozetleri hem de Mesajlar sekmesindeki
  // rozeti besliyor — üçü ayrı ayrı sondaj yapsaydı gereksiz istek
  // katlanırdı.
  const [liveUnreadCount, setLiveUnreadCount] = useState(unreadCount);
  const [liveUnreadMessageCount, setLiveUnreadMessageCount] = useState(unreadMessageCount);
  const [messageToastVisible, setMessageToastVisible] = useState(false);
  const previousMessageCountRef = useRef(unreadMessageCount);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    // Sekme arka plandayken (document.hidden) DB isteği atlanır — global
    // ölçekte boşta duran her sekme aksi halde sonsuza kadar 5sn'de bir
    // istek atmaya devam eder. Öne dönünce visibilitychange dinleyicisi
    // hemen bir kez tazeler, sayaçlar bayat kalmasın diye.
    async function tick() {
      if (document.hidden) return;
      const summary = await fetchUnreadSummaryAction();
      if (cancelled) return;
      setLiveUnreadCount(summary.general);
      setLiveUnreadMessageCount(summary.message);

      // Web'de uygulama açıkken başka bir sayfadaysa (sohbet ekranının
      // kendisinde değilse) yeni mesaj geldiğinde üstten kısa bir bildirim
      // gösterilir — mobil zaten kendi bildirim kanalını kullanır, bu
      // sadece web/PWA için "anlık" hissi veren bir yama.
      if (summary.message > previousMessageCountRef.current && !pathnameRef.current.includes("/messages")) {
        setMessageToastVisible(true);
      }
      previousMessageCountRef.current = summary.message;
    }

    const interval = setInterval(tick, UNREAD_POLL_INTERVAL_MS);
    function handleVisibilityChange() {
      if (!document.hidden) tick();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    function tick() {
      if (document.hidden) return;
      touchLastSeenAction();
    }

    tick();
    const interval = setInterval(tick, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!messageToastVisible) return;
    const timeout = setTimeout(() => setMessageToastVisible(false), 4000);
    return () => clearTimeout(timeout);
  }, [messageToastVisible]);

  return (
    <div className="min-h-dvh bg-background lg:pl-64">
      <Sidebar
        locale={locale}
        items={primary}
        secondaryItems={secondary}
        isAuthenticated={isAuthenticated}
        coinBalance={coinBalance}
        unreadCount={liveUnreadCount}
        unreadMessageCount={liveUnreadMessageCount}
      />

      <AppHeader
        locale={locale}
        isAuthenticated={isAuthenticated}
        coinBalance={coinBalance}
        avatarUrl={avatarUrl}
        unreadCount={liveUnreadCount}
      />

      {messageToastVisible && (
        <Link
          href={`/${locale}/messages`}
          onClick={() => setMessageToastVisible(false)}
          className="fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top))] z-40 mx-auto flex w-fit items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-float lg:left-64 lg:top-4"
        >
          {t("messages.newMessageToast")}
        </Link>
      )}

      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</div>

      <BottomNav locale={locale} items={primary} unreadMessageCount={liveUnreadMessageCount} />
    </div>
  );
}
