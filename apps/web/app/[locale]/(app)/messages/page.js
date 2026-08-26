import Image from "next/image";
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
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <PageTitle>{t("nav.messages")}</PageTitle>

      {result.data.length === 0 ? (
        <EmptyState title={t("messages.emptyTitle")} description={t("messages.emptyBody")} />
      ) : (
        <div className="flex flex-col gap-2">
          {result.data.map(({ chat, otherUser, lastMessage }) => (
            <Link key={chat.id} href={`/${locale}/messages/${chat.id}`}>
              <SectionCard className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                    {otherUser.avatarUrl && (
                      <Image
                        src={otherUser.avatarUrl}
                        alt=""
                        fill
                        unoptimized={otherUser.avatarUrl.startsWith("data:")}
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{otherUser.name}</span>
                    <span className="line-clamp-1 text-sm text-muted-foreground">
                      {lastMessage ? lastMessage.content : t("messages.noMessagesYet")}
                    </span>
                  </div>
                </div>
              </SectionCard>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
