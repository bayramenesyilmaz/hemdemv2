import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { AuthShell } from "@/components/AuthShell";
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
    <AuthShell locale={locale} title={t("auth.onboarding.title")}>
      <OnboardingForm locale={locale} />
    </AuthShell>
  );
}
