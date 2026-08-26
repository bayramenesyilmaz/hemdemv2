import Link from "next/link";
import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function TestHistoryPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const answers = await repositories.test.findAnswersByUser(userId);
  const tests = await Promise.all(answers.map((a) => repositories.test.findById(a.testId)));
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("tests.history")}</PageTitle>

      {answers.length === 0 ? (
        <EmptyState title={t("tests.historyEmptyTitle")} description={t("tests.historyEmptyBody")} />
      ) : (
        <div className="flex flex-col gap-3">
          {answers.map((answer, index) => {
            const test = tests[index];
            if (!test) return null;

            return (
              <SectionCard key={answer.id}>
                <Link
                  href={`/${locale}/tests/${test.id}/result`}
                  className="font-medium text-foreground underline"
                >
                  {test.title}
                </Link>
              </SectionCard>
            );
          })}
        </div>
      )}
    </main>
  );
}
