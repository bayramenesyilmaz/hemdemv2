import Link from "next/link";
import { redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { fetchChatList } from "@hemdem/core/usecases/chat/fetchChatList";
import { getI18n } from "@/locales/server";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/Avatar";
import { MarkMessagesRead } from "./MarkMessagesRead";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function MessagesPage({ params }) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const result = await fetchChatList(repositories, userId);
  const t = await getI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      <PageTitle>{t("nav.messages")}</PageTitle>
      <MarkMessagesRead />

      {result.data.length === 0 ? (
        <EmptyState title={t("messages.emptyTitle")} description={t("messages.emptyBody")} />
      ) : (
        <div className="flex flex-col gap-2">
          {result.data.map(({ chat, otherUser, lastMessage }, index) => (
            <Link
              key={chat.id}
              href={`/${locale}/messages/${chat.id}`}
              className="animate-list-in"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <SectionCard interactive className="flex items-center gap-3">
                <Avatar src={otherUser.avatarUrl} name={otherUser.name} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold text-foreground">{otherUser.name}</span>
                  <span className="line-clamp-1 text-sm text-muted-foreground">
                    {lastMessage ? lastMessage.content : t("messages.noMessagesYet")}
                  </span>
                </div>
                <span aria-hidden="true" className="shrink-0 text-lg text-muted-foreground">
                  →
                </span>
              </SectionCard>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
