import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { MyTestsList } from "./MyTestsList";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function MyTestsPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const tests = await repositories.test.findCreatedByUser(userId);
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <PageTitle>{t("tests.mine")}</PageTitle>
      <MyTestsList locale={locale} tests={tests} />
    </main>
  );
}
