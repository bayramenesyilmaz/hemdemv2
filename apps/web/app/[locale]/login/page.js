import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { LoginForm } from "./LoginForm";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return {
    title: t("auth.login.title"),
    alternates: { canonical: `/${locale}/login` },
  };
}

export default async function LoginPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold text-foreground">{t("auth.login.title")}</h1>
      <LoginForm locale={locale} />
    </main>
  );
}
