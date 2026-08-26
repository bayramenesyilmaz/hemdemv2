import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { buildMetadata } from "@/lib/seo";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "./RegisterForm";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return buildMetadata({ locale, path: "/register", title: t("auth.register.title") });
}

export default async function RegisterPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return (
    <AuthShell locale={locale} title={t("auth.register.title")}>
      <RegisterForm locale={locale} />
    </AuthShell>
  );
}
