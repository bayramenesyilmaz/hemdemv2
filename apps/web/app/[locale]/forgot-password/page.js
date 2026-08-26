import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { buildMetadata } from "@/lib/seo";
import { AuthShell } from "@/components/AuthShell";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return buildMetadata({ locale, path: "/forgot-password", title: t("auth.forgotPassword.title") });
}

export default async function ForgotPasswordPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return (
    <AuthShell locale={locale} title={t("auth.forgotPassword.title")}>
      <ForgotPasswordForm locale={locale} />
    </AuthShell>
  );
}
