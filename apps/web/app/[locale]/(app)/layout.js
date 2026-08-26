import { getAuthUserId } from "@/lib/session";
import { getCurrentProfile, getCurrentCoinBalance } from "@/lib/currentUser";
import { countUnreadNotifications } from "@hemdem/core/usecases/notifications/countUnreadNotifications";
import { repositories } from "@/lib/repositories";
import { AppShell } from "@/components/nav/AppShell";

export default async function AppLayout({ children, params }) {
  const { locale } = await params;
  const userId = await getAuthUserId();

  const [profile, coinBalance, unreadCount] = await Promise.all([
    getCurrentProfile(),
    getCurrentCoinBalance(),
    userId ? countUnreadNotifications(repositories, userId) : Promise.resolve(0),
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
