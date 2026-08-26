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
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg border border-border p-4">
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-muted-foreground">{t("messages.startConversation")}</p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  isMine ? "self-end bg-primary text-primary-foreground" : "self-start bg-muted text-foreground"
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

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("messages.placeholder")}
          rows={1}
          className="flex-1 resize-none"
        />
        <Button type="submit" variant="send" disabled={sending || !content.trim()}>
          {t("messages.send")}
        </Button>
      </form>
    </div>
  );
}
