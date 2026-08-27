import Link from "next/link";
import { setStaticParamsLocale } from "next-international/server";
import { TEST_CATEGORIES } from "@hemdem/core/domain/entities/test";
import { getI18n } from "@/locales/server";
import { repositories } from "@/lib/repositories";
import { buildMetadata } from "@/lib/seo";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { SubNav } from "@/components/SubNav";
import { AdSlot } from "@/components/AdSlot";
import { Button } from "@/components/ui/Button";
import { TestFilters } from "./TestFilters";

function categoryKeyOf(categoryId) {
  return TEST_CATEGORIES.find((c) => c.id === categoryId)?.key ?? "personality";
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return buildMetadata({
    locale,
    path: "/tests",
    title: t("tests.title"),
    description: t("tests.subtitle"),
  });
}

export default async function TestsPage({ params, searchParams }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const sp = await searchParams;

  const categoryId = sp.category ? Number(sp.category) : undefined;
  const language = sp.language || undefined;
  const search = sp.search || undefined;

  const tests = await repositories.test.findMany({ categoryId, language, search });
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle
        action={
          <div className="flex gap-2">
            <TestFilters
              locale={locale}
              initialCategory={sp.category}
              initialLanguage={sp.language}
              initialSearch={sp.search}
            />
            <Button href={`/${locale}/tests/create`} variant="add">
              {t("tests.create")}
            </Button>
          </div>
        }
      >
        {t("tests.title")}
      </PageTitle>

      <SubNav
        items={[
          { href: `/${locale}/tests/mine`, label: t("tests.mine") },
          { href: `/${locale}/tests/history`, label: t("tests.history") },
        ]}
      />

      {tests.length === 0 ? (
        <EmptyState title={t("tests.emptyTitle")} description={t("tests.emptyBody")} />
      ) : (
        <div className="flex flex-col gap-3">
          {tests.map((test, index) => (
            <Link
              key={test.id}
              href={`/${locale}/tests/${test.id}`}
              className="animate-list-in"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <SectionCard interactive className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{test.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {t(`testCategories.${categoryKeyOf(test.categoryId)}`)} · {test.language.toUpperCase()}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-gradient-surface px-3 py-1 text-xs font-semibold text-primary">
                  {t("tests.questionCount", { count: test.questions.length })}
                </span>
              </SectionCard>
            </Link>
          ))}
        </div>
      )}

      <AdSlot label={t("ads.label")} />
    </main>
  );
}
