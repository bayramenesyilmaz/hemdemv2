import { setStaticParamsLocale } from "next-international/server";
import { fetchSupportRequests } from "@hemdem/core/usecases/admin/fetchSupportRequests";
import { getI18n } from "@/locales/server";
import { repositories } from "@/lib/repositories";
import { requireAdmin } from "@/lib/adminGuard";
import { PageTitle } from "@/components/PageTitle";
import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
import { AdminSubNav } from "../AdminSubNav";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function AdminRequestsPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await requireAdmin(locale);
  const result = await fetchSupportRequests(repositories, userId);
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("admin.title")}</PageTitle>
      <AdminSubNav locale={locale} t={t} />

      {result.data.length === 0 ? (
        <EmptyState title={t("admin.requestsEmptyTitle")} />
      ) : (
        <div className="flex flex-col gap-2">
          {result.data.map((request) => (
            <SectionCard key={request.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {t(`support.type${request.type === "complaint" ? "Complaint" : "Request"}`)}
                </span>
                <p className="font-medium text-foreground">{request.subject}</p>
              </div>
              <p className="text-sm text-foreground">{request.description}</p>
              {request.email && <p className="text-xs text-muted-foreground">{request.email}</p>}
            </SectionCard>
          ))}
        </div>
      )}
    </main>
  );
}
