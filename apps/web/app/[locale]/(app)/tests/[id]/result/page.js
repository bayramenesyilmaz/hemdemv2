import Link from "next/link";
import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { fetchTestResults } from "@hemdem/core/usecases/tests/fetchTestResults";
import { calculateAge } from "@hemdem/core/domain/entities/user";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/Avatar";
import { AdSlot } from "@/components/AdSlot";
import { SimilarityBadge, SimilarityBar } from "@/components/SimilarityBadge";
import { Button } from "@/components/ui/Button";
import { ShareButton } from "@/components/ShareButton";
import { HeartIcon, MessagesIcon } from "@/components/icons";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function TestResultPage({ params }) {
  const { locale, id } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const result = await fetchTestResults(repositories, userId, id);
  if (result.status === "error") {
    if (result.message === "not_answered_yet") {
      redirect(`/${locale}/tests/${id}`);
    }
    redirect(`/${locale}/tests`);
  }

  const { test, matches } = result.data;
  const t = await getI18n();

  const perfectMatches = matches.filter((m) => m.canDirectMessage);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">{t("tests.resultCompleted")}</p>
        <h1 className="text-xl font-semibold text-foreground">{test.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t("tests.resultSubtitle", { count: matches.length })}
        </p>
        <ShareButton
          path={`/${locale}/tests/${test.id}`}
          title={t("share.testTitle")}
          text={t("share.testText", { title: test.title })}
          label={t("share.button")}
          copiedLabel={t("share.copied")}
          className="self-start"
        />
      </header>

      {perfectMatches.length > 0 && (
        <SectionCard className="flex items-start gap-3 border-primary/30 bg-gradient-surface">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
            <HeartIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">{t("tests.perfectMatchTitle")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("tests.perfectMatchBody", { count: perfectMatches.length })}
            </p>
          </div>
        </SectionCard>
      )}

      <AdSlot label={t("ads.label")} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">{t("tests.compareTitle")}</h2>

        {matches.length === 0 ? (
          <EmptyState
            icon={<HeartIcon className="h-6 w-6" />}
            title={t("tests.compareEmptyTitle")}
            description={t("tests.compareEmptyBody")}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {matches.map(({ profile, similarity, canDirectMessage }, index) => (
              <li
                key={profile.id}
                className="animate-list-in"
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <SectionCard className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={profile.avatarUrl} name={profile.name} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/${locale}/u/${profile.id}`}
                        className="block truncate font-semibold text-foreground hover:underline"
                      >
                        {profile.name}
                        {profile.birthdate ? `, ${calculateAge(profile.birthdate)}` : ""}
                      </Link>
                      {profile.country && (
                        <p className="truncate text-sm text-muted-foreground">{profile.country}</p>
                      )}
                    </div>
                    <SimilarityBadge value={similarity} />
                  </div>

                  <SimilarityBar value={similarity} />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      href={`/${locale}/tests/${test.id}/compare/${profile.id}`}
                      variant="outline"
                      className="flex-1"
                    >
                      {t("tests.viewAnswers")}
                    </Button>
                    {canDirectMessage && (
                      <Button href={`/${locale}/u/${profile.id}`} variant="confirm" className="flex-1">
                        <MessagesIcon className="h-4 w-4" />
                        {t("tests.messageDirectly")}
                      </Button>
                    )}
                  </div>
                </SectionCard>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button href={`/${locale}/tests`} variant="ghost">
        {t("tests.backToTests")}
      </Button>
    </main>
  );
}
