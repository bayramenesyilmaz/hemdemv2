import { setStaticParamsLocale } from "next-international/server";
import { fetchAdminUsers } from "@hemdem/core/usecases/admin/fetchAdminUsers";
import { getI18n } from "@/locales/server";
import { repositories } from "@/lib/repositories";
import { requireAdmin } from "@/lib/adminGuard";
import { PageTitle } from "@/components/PageTitle";
import { AdminSubNav } from "../AdminSubNav";
import { AdminUsersList } from "./AdminUsersList";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function AdminUsersPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await requireAdmin(locale);
  const result = await fetchAdminUsers(repositories, userId);
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("admin.title")}</PageTitle>
      <AdminSubNav locale={locale} t={t} />
      <AdminUsersList locale={locale} users={result.data} />
    </main>
  );
}
