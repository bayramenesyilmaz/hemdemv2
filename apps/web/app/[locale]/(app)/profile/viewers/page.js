import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { COIN_COSTS } from "@hemdem/core/domain/entities/coin";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
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

  const count = await repositories.profileView.countViews(userId);
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("viewers.title")}</PageTitle>

      <SectionCard className="flex flex-col gap-4">
        <p className="text-foreground">{t("viewers.viewCount", { count })}</p>
        {count === 0 ? (
          <EmptyState title={t("viewers.emptyTitle")} description={t("viewers.emptyBody")} />
        ) : (
          <UnlockViewersPanel locale={locale} cost={COIN_COSTS.unlockProfileViewers} />
        )}
      </SectionCard>
    </main>
  );
}
