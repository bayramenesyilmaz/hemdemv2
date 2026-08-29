import { redirect } from "next/navigation";
import Link from "next/link";
import { setStaticParamsLocale } from "next-international/server";
import { COIN_COSTS } from "@hemdem/core/domain/entities/coin";
import { fetchProfileViewersPreview } from "@hemdem/core/usecases/profile/fetchProfileViewersPreview";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/Avatar";
import { UnlockViewersPanel } from "./UnlockViewersPanel";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function ProfileViewersPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const previewResult = await fetchProfileViewersPreview(repositories, userId);
  const { viewers: previewViewers, totalCount } = previewResult.data;
  const remainingCount = totalCount - previewViewers.length;
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("viewers.title")}</PageTitle>

      <SectionCard className="flex flex-col gap-4">
        <p className="text-foreground">{t("viewers.viewCount", { count: totalCount })}</p>
        {totalCount === 0 ? (
          <EmptyState title={t("viewers.emptyTitle")} description={t("viewers.emptyBody")} />
        ) : (
          <>
            {/* İlk 3 görüntüleyen her zaman ücretsiz: kullanıcılar coin
                ödemeden önce özelliğin değerini görsün diye. */}
            <div className="flex flex-col gap-2">
              {previewViewers.map(({ viewer }) => (
                <Link
                  key={viewer.id}
                  href={`/${locale}/u/${viewer.id}`}
                  className="flex items-center gap-2 font-medium text-foreground"
                >
                  <Avatar src={viewer.avatarUrl} name={viewer.name} size="sm" />
                  <span className="underline">{viewer.name}</span>
                </Link>
              ))}
            </div>

            {remainingCount > 0 && (
              <UnlockViewersPanel
                locale={locale}
                cost={COIN_COSTS.unlockProfileViewers}
                remainingCount={remainingCount}
                excludeIds={previewViewers.map(({ viewer }) => viewer.id)}
              />
            )}
          </>
        )}
      </SectionCard>
    </main>
  );
}
