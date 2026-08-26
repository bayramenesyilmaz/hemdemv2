import { setStaticParamsLocale } from "next-international/server";
import { fetchPendingTests } from "@hemdem/core/usecases/admin/fetchPendingTests";
import { getI18n } from "@/locales/server";
import { repositories } from "@/lib/repositories";
import { requireAdmin } from "@/lib/adminGuard";
import { PageTitle } from "@/components/PageTitle";
import { AdminSubNav } from "../AdminSubNav";
import { AdminPendingTestsList } from "./AdminPendingTestsList";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function AdminTestsPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await requireAdmin(locale);
  const result = await fetchPendingTests(repositories, userId);
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <PageTitle>{t("admin.title")}</PageTitle>
      <AdminSubNav locale={locale} t={t} />
      <AdminPendingTestsList locale={locale} initialTests={result.data} />
    </main>
  );
}
