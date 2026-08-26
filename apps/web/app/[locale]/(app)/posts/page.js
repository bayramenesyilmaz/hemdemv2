import { setStaticParamsLocale } from "next-international/server";
import { fetchFeed } from "@hemdem/core/usecases/posts/fetchFeed";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { EmptyState } from "@/components/EmptyState";
import { InfoBanner } from "@/components/InfoBanner";
import { Button } from "@/components/ui/Button";
import { PostComposer } from "./PostComposer";
import { PostFeedList } from "./PostFeedList";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return {
    title: t("posts.title"),
    description: t("posts.subtitle"),
    alternates: { canonical: `/${locale}/posts` },
  };
}

export default async function PostsPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  const [feedResult, tests] = await Promise.all([
    fetchFeed(repositories, { limit: 30 }),
    userId ? repositories.test.findMany({}) : Promise.resolve([]),
  ]);
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <PageTitle>{t("posts.title")}</PageTitle>

      {userId ? (
        <PostComposer tests={tests} />
      ) : (
        <InfoBanner>
          {t("posts.guestNotice")}{" "}
          <Button href={`/${locale}/register`} variant="link">
            {t("home.ctaRegister")}
          </Button>
        </InfoBanner>
      )}

      {feedResult.data.length === 0 ? (
        <EmptyState title={t("posts.emptyTitle")} description={t("posts.emptyBody")} />
      ) : (
        <PostFeedList locale={locale} entries={feedResult.data} currentUserId={userId} />
      )}
    </main>
  );
}
