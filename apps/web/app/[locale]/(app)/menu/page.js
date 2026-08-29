import { setStaticParamsLocale } from "next-international/server";
import { getAuthUserId } from "@/lib/session";
import { getCurrentProfile } from "@/lib/currentUser";
import { MenuPageContent } from "./MenuPageContent";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function MenuPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  const profile = userId ? await getCurrentProfile() : null;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:hidden lg:px-6 lg:py-8">
      <MenuPageContent
        locale={locale}
        isAuthenticated={Boolean(userId)}
        isAdmin={profile?.role === "admin"}
      />
    </main>
  );
}
