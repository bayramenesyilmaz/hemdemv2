import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { AuthShell } from "@/components/AuthShell";
import { ResetPasswordForm } from "./ResetPasswordForm";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return {
    title: t("auth.resetPassword.title"),
    robots: { index: false },
  };
}

export default async function ResetPasswordPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return (
    <AuthShell locale={locale} title={t("auth.resetPassword.title")}>
      <ResetPasswordForm locale={locale} />
    </AuthShell>
  );
}
