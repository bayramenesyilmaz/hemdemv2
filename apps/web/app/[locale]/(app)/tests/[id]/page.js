import { notFound, redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { TEST_CATEGORIES } from "@hemdem/core/domain/entities/test";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { buildMetadata } from "@/lib/seo";
import { SolveTestForm } from "./SolveTestForm";

function categoryKeyOf(categoryId) {
  return TEST_CATEGORIES.find((c) => c.id === categoryId)?.key ?? "personality";
}

export async function generateMetadata({ params }) {
  const { locale, id } = await params;
  setStaticParamsLocale(locale);
  const test = await repositories.test.findById(id);
  if (!test) return {};

  const t = await getI18n();

  return buildMetadata({
    locale,
    path: `/tests/${id}`,
    title: test.title,
    description: t("tests.metaDescription", {
      category: t(`testCategories.${categoryKeyOf(test.categoryId)}`),
      points: test.point,
    }),
  });
}

export default async function TestDetailPage({ params }) {
  const { locale, id } = await params;
  setStaticParamsLocale(locale);

  const test = await repositories.test.findById(id);
  if (!test) {
    notFound();
  }

  const userId = await getAuthUserId();
  if (userId) {
    const existingAnswer = await repositories.test.findAnswer(userId, id);
    if (existingAnswer) {
      redirect(`/${locale}/tests/${id}/result`);
    }
  }

  const t = await getI18n();
  const domain = process.env.NEXT_PUBLIC_DOMAIN ?? "https://example.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: test.title,
    url: `${domain}/${locale}/tests/${id}`,
    inLanguage: test.language,
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-2xl font-bold text-foreground">{test.title}</h1>
      <p className="text-sm text-muted-foreground">
        {test.point} {t("tests.points")}
      </p>
      <SolveTestForm locale={locale} test={test} />
    </main>
  );
}
