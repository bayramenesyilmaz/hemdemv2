import { getAuthUserId } from "@/lib/session";
import { getCurrentProfile, getCurrentCoinBalance } from "@/lib/currentUser";
import { safeCountUnreadNotifications } from "@/lib/notifications";
import { AppShell } from "@/components/nav/AppShell";

export default async function AppLayout({ children, params }) {
  const { locale } = await params;
  const userId = await getAuthUserId();

  const [profile, coinBalance, unreadCount] = await Promise.all([
    getCurrentProfile(),
    getCurrentCoinBalance(),
    userId ? safeCountUnreadNotifications(userId) : Promise.resolve(0),
  ]);

  return (
    <AppShell
      locale={locale}
      isAuthenticated={Boolean(userId)}
      isAdmin={profile?.role === "admin"}
      coinBalance={coinBalance}
      avatarUrl={profile?.avatarUrl ?? null}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
