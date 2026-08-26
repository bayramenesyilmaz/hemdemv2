import { notFound, redirect } from "next/navigation";
import { setStaticParamsLocale } from "next-international/server";
import { fetchChatMessages } from "@hemdem/core/usecases/chat/fetchChatMessages";
import { getAuthUserId } from "@/lib/session";
import { repositories } from "@/lib/repositories";
import { PageTitle } from "@/components/PageTitle";
import { ChatThread } from "./ChatThread";

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
      <PageTitle>{otherUser.name}</PageTitle>
      <ChatThread
        chatId={Number(chatId)}
        recipientId={otherUser.id}
        initialMessages={messages}
        currentUserId={userId}
      />
    </main>
  );
}
