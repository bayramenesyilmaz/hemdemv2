import Link from "next/link";
import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { fetchTestResults } from "@hemdem/core/usecases/tests/fetchTestResults";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";

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

  const { test, comparisons } = result.data;
  const t = await getI18n();

  const profiles = await Promise.all(
    comparisons.map((c) => repositories.user.findById(c.userId))
  );

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">{t("tests.resultTitle", { title: test.title })}</h1>

      <SectionCard>
        <p className="text-foreground">{t("tests.resultCompleted")}</p>
        {test.point > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {t("tests.resultPointsEarned", { points: test.point })}
          </p>
        )}
      </SectionCard>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">{t("tests.compareTitle")}</h2>

        {comparisons.length === 0 ? (
          <EmptyState title={t("tests.compareEmptyTitle")} description={t("tests.compareEmptyBody")} />
        ) : (
          comparisons.map((c, index) => {
            const profile = profiles[index];
            if (!profile) return null;

            return (
              <SectionCard key={c.userId} className="flex items-center justify-between">
                <Link href={`/${locale}/u/${c.userId}`} className="font-medium text-foreground underline">
                  {profile.name}
                </Link>
                <span className="text-sm text-muted-foreground">%{c.similarity}</span>
              </SectionCard>
            );
          })
        )}
      </div>
    </main>
  );
}
