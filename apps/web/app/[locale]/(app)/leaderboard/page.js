import Link from "next/link";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { repositories } from "@/lib/repositories";
import { buildMetadata } from "@/lib/seo";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/Avatar";
import { AdSlot } from "@/components/AdSlot";

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
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("leaderboard.title")}</PageTitle>

      {entries.length === 0 ? (
        <EmptyState title={t("leaderboard.emptyTitle")} />
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry, index) => {
            const profile = profiles[index];
            if (!profile) return null;

            // İlk üç sıra gradyanlı madalya rozetiyle öne çıkar; geri
            // kalanı sade numara — liste uzadıkça gürültü olmasın.
            const isPodium = index < 3;

            return (
              <Link
                key={entry.userId}
                href={`/${locale}/u/${entry.userId}`}
                className="animate-list-in"
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <SectionCard interactive className="flex items-center gap-3">
                  <span
                    className={
                      isPodium
                        ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground shadow-soft"
                        : "w-9 shrink-0 text-center text-sm font-semibold text-muted-foreground"
                    }
                  >
                    {index + 1}
                  </span>
                  <Avatar src={profile.avatarUrl} name={profile.name} size="sm" />
                  <span className="min-w-0 flex-1 truncate font-semibold text-foreground">{profile.name}</span>
                  <span className="shrink-0 rounded-full bg-gradient-surface px-3 py-1 text-xs font-semibold text-primary">
                    {entry.point}
                  </span>
                </SectionCard>
              </Link>
            );
          })}
        </div>
      )}

      <AdSlot label={t("ads.label")} />
    </main>
  );
}
