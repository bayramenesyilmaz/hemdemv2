import { notFound, redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { SolveTestForm } from "./SolveTestForm";

export async function generateMetadata({ params }) {
  const { locale, id } = await params;
  const test = await repositories.test.findById(id);
  if (!test) return {};

  return {
    title: test.title,
    alternates: { canonical: `/${locale}/tests/${id}` },
  };
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

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">{test.title}</h1>
      <p className="text-sm text-muted-foreground">
        {test.point} {t("tests.points")}
      </p>
      <SolveTestForm locale={locale} test={test} />
    </main>
  );
}
