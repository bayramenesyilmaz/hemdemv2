import { setStaticParamsLocale } from "next-international/server";
import { fetchFeed } from "@hemdem/core/usecases/posts/fetchFeed";
import { fetchLatestNotesByUsers } from "@hemdem/core/usecases/notes/fetchLatestNotesByUsers";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { getCurrentProfile } from "@/lib/currentUser";
import { repositories } from "@/lib/repositories";
import { buildMetadata } from "@/lib/seo";
import { PageTitle } from "@/components/PageTitle";
import { EmptyState } from "@/components/EmptyState";
import { InfoBanner } from "@/components/InfoBanner";
import { Button } from "@/components/ui/Button";
import { PostComposer } from "./PostComposer";
import { PostFeedList } from "./PostFeedList";
import { PostAuthorRail } from "./PostAuthorRail";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  const t = await getI18n();

  return buildMetadata({
    locale,
    path: "/posts",
    title: t("posts.title"),
    description: t("posts.subtitle"),
  });
}

export default async function PostsPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  const [feedResult, author] = await Promise.all([
    fetchFeed(repositories, { limit: 30 }),
    getCurrentProfile(),
  ]);

  const authorIds = [...new Set(feedResult.data.map(({ author: postAuthor }) => postAuthor.id))];
  if (userId && !authorIds.includes(userId)) authorIds.push(userId);
  const notesResult = await fetchLatestNotesByUsers(repositories, authorIds);

  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("posts.title")}</PageTitle>

      <PostAuthorRail
        locale={locale}
        entries={feedResult.data}
        currentUserId={userId}
        currentAuthor={author}
        notesByAuthor={notesResult.data}
      />

      {userId ? (
        <PostComposer locale={locale} author={author} />
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
