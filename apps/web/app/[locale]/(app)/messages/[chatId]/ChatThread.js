"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { sendMessageAction, fetchChatMessagesAction } from "@/lib/actions/chatActions";

const POLL_INTERVAL_MS = 4000;

/**
 * Sohbet mesaj akışı. Supabase Realtime (postgres_changes), RLS
 * politikası olmayan bu projede (bkz. migrations/0001_init.sql'deki
 * "zero policy" tasarımı) client tarafından abone olunamaz — servis
 * rolü sadece sunucu tarafında kullanılıyor. Bunun yerine kısa aralıklı
 * polling ile yeni mesajlar kontrol edilir; hem mock hem gerçek modda
 * aynı şekilde çalışır.
 */
export function ChatThread({ chatId, currentUserId, initialMessages, recipientId }) {
  const t = useI18n();
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const lastMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await fetchChatMessagesAction(chatId);
      if (result.status === "success") {
        setMessages(result.data.messages);
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [chatId]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim()) return;
    setError(null);
    setSending(true);

    const result = await sendMessageAction(recipientId, content);
    setSending(false);

    if (result.status === "error") {
      setError(t(`messages.errors.${result.message}`));
      return;
    }

    setContent("");
    const refreshed = await fetchChatMessagesAction(chatId);
    if (refreshed.status === "success") {
      setMessages(refreshed.data.messages);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="scrollbar-none flex flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border border-border bg-gradient-surface p-4">
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-muted-foreground">{t("messages.startConversation")}</p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === currentUserId;
            // Balonun kendi tarafına bakan köşesi bilinçli olarak daha az
            // yuvarlak — konuşmanın yönü rengi ayırt edemeyenler için de
            // biçimden okunabilsin.
            return (
              <div
                key={message.id}
                className={`max-w-[78%] animate-list-in px-4 py-2.5 text-[15px] leading-snug shadow-soft ${
                  isMine
                    ? "self-end rounded-2xl rounded-br-md bg-gradient-primary text-primary-foreground"
                    : "self-start rounded-2xl rounded-bl-md bg-card text-foreground"
                }`}
              >
                {message.content}
              </div>
            );
          })
        )}
        <div ref={bottomRef} data-last-message-id={lastMessageId} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Mesaj alanının kendi kaydırdığı içerikten ayrı, sabit bir "yüzen"
          çubuk hissi versin diye kart görünümü + gölge. */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-float"
      >
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("messages.placeholder")}
          rows={1}
          className="flex-1 resize-none border-none bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button type="submit" variant="send" disabled={sending || !content.trim()}>
          {t("messages.send")}
        </Button>
      </form>
    </div>
  );
}
