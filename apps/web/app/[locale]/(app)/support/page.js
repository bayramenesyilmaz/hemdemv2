import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { PageTitle } from "@/components/PageTitle";
import { SupportForm } from "./SupportForm";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return {
    title: t("support.title"),
    alternates: { canonical: `/${locale}/support` },
  };
}

export default async function SupportPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <PageTitle>{t("support.title")}</PageTitle>
      <SupportForm isAuthenticated={Boolean(userId)} />
    </main>
  );
}
