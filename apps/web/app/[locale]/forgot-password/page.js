import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return {
    title: t("auth.forgotPassword.title"),
    alternates: { canonical: `/${locale}/forgot-password` },
  };
}

export default async function ForgotPasswordPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold text-foreground">{t("auth.forgotPassword.title")}</h1>
      <ForgotPasswordForm locale={locale} />
    </main>
  );
}
