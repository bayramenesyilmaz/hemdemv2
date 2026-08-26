import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { isProfileComplete } from "@hemdem/core/domain/entities/user";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { LogoutButton } from "@/components/LogoutButton";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function DiscoverPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const profile = await repositories.user.findById(userId);
  if (!isProfileComplete(profile)) {
    redirect(`/${locale}/onboarding`);
  }

  const t = await getI18n();

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold text-foreground">
        {t("discover.placeholderTitle", { name: profile.name })}
      </h1>
      <p className="max-w-sm text-muted-foreground">{t("discover.placeholderBody")}</p>
      <LogoutButton locale={locale} />
    </main>
  );
}
