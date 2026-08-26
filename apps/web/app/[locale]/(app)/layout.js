import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({ children, params }) {
  const { locale } = await params;
  const userId = await getAuthUserId();
  const coinBalance = userId ? await repositories.coin.getBalance(userId) : null;
  const profile = userId ? await repositories.user.findById(userId) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav
        locale={locale}
        isAuthenticated={Boolean(userId)}
        coinBalance={coinBalance}
        isAdmin={profile?.role === "admin"}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
