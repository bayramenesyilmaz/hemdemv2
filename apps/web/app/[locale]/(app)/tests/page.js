import Link from "next/link";
import { setStaticParamsLocale } from "next-international/server";
import { TEST_CATEGORIES } from "@hemdem/core/domain/entities/test";
import { getI18n } from "@/locales/server";
import { repositories } from "@/lib/repositories";
import { buildMetadata } from "@/lib/seo";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
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

      <div className="flex gap-4 text-sm">
        <Link href={`/${locale}/tests/mine`} className="text-muted-foreground underline">
          {t("tests.mine")}
        </Link>
        <Link href={`/${locale}/tests/history`} className="text-muted-foreground underline">
          {t("tests.history")}
        </Link>
      </div>

      {tests.length === 0 ? (
        <EmptyState title={t("tests.emptyTitle")} description={t("tests.emptyBody")} />
      ) : (
        <div className="flex flex-col gap-3">
          {tests.map((test) => (
            <SectionCard key={test.id}>
              <Link href={`/${locale}/tests/${test.id}`} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{test.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {t(`testCategories.${categoryKeyOf(test.categoryId)}`)} · {test.language.toUpperCase()}
                  </p>
                </div>
                <span className="whitespace-nowrap text-sm text-muted-foreground">
                  {test.point} {t("tests.points")}
                </span>
              </Link>
            </SectionCard>
          ))}
        </div>
      )}
    </main>
  );
}
