import Link from "next/link";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { repositories } from "@/lib/repositories";
import { buildMetadata } from "@/lib/seo";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return buildMetadata({
    locale,
    path: "/leaderboard",
    title: t("leaderboard.title"),
    description: t("leaderboard.subtitle"),
  });
}

export default async function LeaderboardPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const entries = await repositories.test.findLeaderboard(50);
  const profiles = await Promise.all(entries.map((e) => repositories.user.findById(e.userId)));
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <PageTitle>{t("leaderboard.title")}</PageTitle>

      {entries.length === 0 ? (
        <EmptyState title={t("leaderboard.emptyTitle")} />
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry, index) => {
            const profile = profiles[index];
            if (!profile) return null;

            return (
              <SectionCard key={entry.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-sm font-semibold text-muted-foreground">{index + 1}</span>
                  <Link href={`/${locale}/u/${entry.userId}`} className="font-medium text-foreground underline">
                    {profile.name}
                  </Link>
                </div>
                <span className="text-sm text-muted-foreground">{entry.point}</span>
              </SectionCard>
            );
          })}
        </div>
      )}
    </main>
  );
}
