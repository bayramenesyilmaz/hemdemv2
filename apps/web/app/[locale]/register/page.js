import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { RegisterForm } from "./RegisterForm";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return {
    title: t("auth.register.title"),
    alternates: { canonical: `/${locale}/register` },
  };
}

export default async function RegisterPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold text-foreground">{t("auth.register.title")}</h1>
      <RegisterForm locale={locale} />
    </main>
  );
}
