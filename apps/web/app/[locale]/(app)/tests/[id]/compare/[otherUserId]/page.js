import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { compareAnswers } from "@hemdem/core/usecases/tests/compareAnswers";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { SectionCard } from "@/components/SectionCard";
import { Avatar } from "@/components/Avatar";
import { AdSlot } from "@/components/AdSlot";
import { SimilarityBadge, SimilarityBar } from "@/components/SimilarityBadge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export async function generateMetadata() {
  return { robots: { index: false } };
}

/**
 * Soru soru cevap karşılaştırması: her soruda kimin hangi şıkkı seçtiği
 * isimleriyle birlikte görünür. Kullanıcının "neden bu kadar uyumluyuz"
 * sorusunu somut olarak cevaplayan ekran budur.
 */
export default async function CompareAnswersPage({ params }) {
  const { locale, id, otherUserId } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const result = await compareAnswers(repositories, userId, id, otherUserId);
  if (result.status === "error") {
    redirect(`/${locale}/tests/${id}/result`);
  }

  const { test, ownProfile, otherProfile, rows, similarity } = result.data;
  const t = await getI18n();
  const matchCount = rows.filter((row) => row.isMatch).length;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground lg:text-xl">{test.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t("tests.compareSubtitle", { matched: matchCount, total: rows.length })}
        </p>
      </header>

      <SectionCard className="flex flex-col gap-4 bg-gradient-surface">
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <Avatar src={ownProfile?.avatarUrl} name={ownProfile?.name} />
            <span className="max-w-24 truncate text-xs font-medium text-foreground">
              {t("tests.you")}
            </span>
          </div>
          <SimilarityBadge value={similarity} className="text-base" />
          <div className="flex flex-col items-center gap-1.5">
            <Avatar src={otherProfile.avatarUrl} name={otherProfile.name} />
            <span className="max-w-24 truncate text-xs font-medium text-foreground">
              {otherProfile.name}
            </span>
          </div>
        </div>
        <SimilarityBar value={similarity} />
      </SectionCard>

      <ol className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <li
            key={row.questionId}
            className="animate-list-in"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <SectionCard
              className={cn("flex flex-col gap-3", row.isMatch && "border-primary/40 bg-primary/5")}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-foreground">
                  <span className="mr-2 text-primary">{index + 1}.</span>
                  {row.questionText}
                </p>
                {row.isMatch && (
                  <span className="shrink-0 rounded-full bg-gradient-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                    {t("tests.sameAnswer")}
                  </span>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <AnswerCell
                  name={t("tests.you")}
                  choice={row.ownChoice}
                  highlighted={row.isMatch}
                  emptyLabel={t("tests.noAnswer")}
                />
                <AnswerCell
                  name={otherProfile.name}
                  choice={row.otherChoice}
                  highlighted={row.isMatch}
                  emptyLabel={t("tests.noAnswer")}
                />
              </div>
            </SectionCard>
          </li>
        ))}
      </ol>

      <AdSlot label={t("ads.label")} />

      <Button href={`/${locale}/tests/${test.id}/result`} variant="outline">
        {t("tests.backToResult")}
      </Button>
    </main>
  );
}

function AnswerCell({ name, choice, highlighted, emptyLabel }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2",
        highlighted ? "border-primary/40 bg-card" : "border-border bg-background"
      )}
    >
      <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {name}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{choice ?? emptyLabel}</p>
    </div>
  );
}
