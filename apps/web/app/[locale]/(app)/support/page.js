import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { buildMetadata } from "@/lib/seo";
import { PageTitle } from "@/components/PageTitle";
import { SupportForm } from "./SupportForm";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return buildMetadata({
    locale,
    path: "/support",
    title: t("support.title"),
    description: t("support.metaDescription"),
  });
}

export default async function SupportPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("support.title")}</PageTitle>
      <SupportForm isAuthenticated={Boolean(userId)} />
    </main>
  );
}
