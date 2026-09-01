import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { setStaticParamsLocale } from "next-international/server";
import { fetchChatMessages } from "@hemdem/core/usecases/chat/fetchChatMessages";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { Avatar } from "@/components/Avatar";
import { ChatThread } from "./ChatThread";
import { SafetyMenu } from "../../u/[id]/SafetyMenu";

export async function generateMetadata() {
  return { robots: { index: false } };
}

export default async function ChatPage({ params }) {
  const { locale, chatId } = await params;
  setStaticParamsLocale(locale);

  const userId = await getAuthUserId();
  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const result = await fetchChatMessages(repositories, userId, Number(chatId));
  if (result.status === "error") {
    notFound();
  }

  const { otherUser, messages } = result.data;

  // Sohbet ekranı kalan dikey alanı tam doldurur: mobilde 100dvh eksi üst
  // header (3.5rem) ve alt navigasyon (4rem + safe-area); masaüstünde alt
  // navigasyon olmadığı için sadece dikey boşluk düşülür.
  return (
    <main className="mx-auto flex h-[calc(100dvh-7.5rem-env(safe-area-inset-bottom))] max-w-2xl flex-col gap-4 px-4 py-4 lg:h-[calc(100dvh-4rem)] lg:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/${locale}/u/${otherUser.id}`} className="flex min-w-0 items-center gap-3">
          <Avatar src={otherUser.avatarUrl} name={otherUser.name} size="sm" />
          <h1 className="truncate text-lg font-semibold text-foreground lg:text-xl">{otherUser.name}</h1>
        </Link>
        <SafetyMenu targetUserId={otherUser.id} targetName={otherUser.name} />
      </div>
      <ChatThread
        chatId={Number(chatId)}
        recipientId={otherUser.id}
        initialMessages={messages}
        currentUserId={userId}
      />
    </main>
  );
}
