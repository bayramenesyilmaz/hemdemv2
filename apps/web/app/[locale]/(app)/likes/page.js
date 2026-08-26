import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { fetchIncomingLikes } from "@hemdem/core/usecases/discover/fetchIncomingLikes";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { EmptyState } from "@/components/EmptyState";
import { IncomingLikesList } from "./IncomingLikesList";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function LikesPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const result = await fetchIncomingLikes(repositories, userId);
  const profiles = await Promise.all(result.data.map((s) => repositories.user.findById(s.fromUser)));
  const likers = result.data
    .map((swipe, i) => ({ swipe, profile: profiles[i] }))
    .filter((entry) => entry.profile);

  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("nav.likes")}</PageTitle>

      {likers.length === 0 ? (
        <EmptyState title={t("likes.emptyTitle")} description={t("likes.emptyBody")} />
      ) : (
        <IncomingLikesList locale={locale} likers={likers} />
      )}
    </main>
  );
}
