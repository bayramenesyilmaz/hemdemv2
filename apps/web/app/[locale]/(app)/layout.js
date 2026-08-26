import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { AppShell } from "@/components/nav/AppShell";

export default async function AppLayout({ children, params }) {
  const { locale } = await params;
  const userId = await getAuthUserId();

  const [coinBalance, profile] = userId
    ? await Promise.all([repositories.coin.getBalance(userId), repositories.user.findById(userId)])
    : [null, null];

  return (
    <AppShell
      locale={locale}
      isAuthenticated={Boolean(userId)}
      isAdmin={profile?.role === "admin"}
      coinBalance={coinBalance}
      avatarUrl={profile?.avatarUrl ?? null}
    >
      {children}
    </AppShell>
  );
}
