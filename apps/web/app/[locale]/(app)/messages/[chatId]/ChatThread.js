"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { sendMessageAction, fetchChatMessagesAction, markChatReadAction } from "@/lib/actions/chatActions";

const POLL_INTERVAL_MS = 2500;

/**
 * Sohbet mesaj akışı. Supabase Realtime (postgres_changes), RLS
 * politikası olmayan bu projede (bkz. migrations/0001_init.sql'deki
 * "zero policy" tasarımı) client tarafından abone olunamaz — servis
 * rolü sadece sunucu tarafında kullanılıyor. Bunun yerine kısa aralıklı
 * polling ile yeni mesajlar kontrol edilir; hem mock hem gerçek modda
 * aynı şekilde çalışır.
 */
export function ChatThread({ chatId, currentUserId, initialMessages, initialReadStates, recipientId }) {
  const t = useI18n();
  const [messages, setMessages] = useState(initialMessages);
  const [readStates, setReadStates] = useState(initialReadStates ?? []);
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const lastMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    // Sekme arka plandayken bu ekrandan uzaklaşılmış demektir — istek
    // atlanır, öne dönünce hemen bir kez tazelenir. Thread açıkken her
    // tick'te "okundu" da tazelenir (bkz. markChatReadAction).
    async function tick() {
      if (document.hidden) return;
      markChatReadAction(chatId);
      const result = await fetchChatMessagesAction(chatId);
      if (result.status === "success") {
        setMessages(result.data.messages);
        setReadStates(result.data.readStates);
      }
    }
    tick();
    const interval = setInterval(tick, POLL_INTERVAL_MS);
    function handleVisibilityChange() {
      if (!document.hidden) tick();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [chatId]);

  // Sadece kendi gönderdiğim SON mesajın altında "Görüldü" gösterilir
  // (mesaj başına çentik yerine minimal bir gösterge) — karşı tarafın bu
  // sohbetteki son okuma zamanı, o mesajın gönderim zamanından sonraysa.
  const otherUserReadAt = readStates.find((r) => r.userId !== currentUserId)?.lastReadAt;
  let lastOwnMessageId = null;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].senderId === currentUserId) {
      lastOwnMessageId = messages[i].id;
      break;
    }
  }
  const lastOwnMessage = messages.find((m) => m.id === lastOwnMessageId);
  const lastOwnMessageSeen =
    lastOwnMessage && otherUserReadAt && new Date(otherUserReadAt) >= new Date(lastOwnMessage.createdAt);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim()) return;
    setError(null);
    setSending(true);

    const result = await sendMessageAction(recipientId, content);
    setSending(false);

    if (result.status === "error") {
      setError(
        result.message === "inappropriate_content"
          ? t("messages.errors.inappropriate_content", { words: (result.data?.flaggedWords ?? []).join(", ") })
          : t(`messages.errors.${result.message}`)
      );
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
              <div key={message.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[78%] animate-list-in px-4 py-2.5 text-[15px] leading-snug shadow-soft ${
                    isMine
                      ? "rounded-2xl rounded-br-md bg-gradient-primary text-primary-foreground"
                      : "rounded-2xl rounded-bl-md bg-card text-foreground"
                  }`}
                >
                  {message.content}
                </div>
                {message.id === lastOwnMessageId && lastOwnMessageSeen && (
                  <span className="mt-0.5 text-xs text-muted-foreground">{t("messages.seen")}</span>
                )}
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
