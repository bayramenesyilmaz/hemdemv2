import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { OnboardingForm } from "./OnboardingForm";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return {
    title: t("auth.onboarding.title"),
    robots: { index: false },
  };
}

export default async function OnboardingPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const t = await getI18n();

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold text-foreground">{t("auth.onboarding.title")}</h1>
      <OnboardingForm locale={locale} />
    </main>
  );
}
