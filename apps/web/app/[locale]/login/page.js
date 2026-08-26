import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { buildMetadata } from "@/lib/seo";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "./LoginForm";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return buildMetadata({ locale, path: "/login", title: t("auth.login.title") });
}

export default async function LoginPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return (
    <AuthShell locale={locale} title={t("auth.login.title")}>
      <LoginForm locale={locale} />
    </AuthShell>
  );
}
