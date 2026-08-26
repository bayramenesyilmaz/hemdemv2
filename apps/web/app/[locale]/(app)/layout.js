import { getAuthUserId } from "@/lib/session";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({ children, params }) {
  const { locale } = await params;
  const userId = await getAuthUserId();

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav locale={locale} isAuthenticated={Boolean(userId)} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
