"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { COIN_COSTS } from "@hemdem/core/domain/entities/coin";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { sendMessageAction } from "@/lib/actions/chatActions";

export function SendMessageDialog({ locale, recipientId, recipientName }) {
  const t = useI18n();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await sendMessageAction(recipientId, content);
    setLoading(false);

    if (result.status === "error") {
      setError(t(`messages.errors.${result.message}`));
      return;
    }

    router.push(`/${locale}/messages/${result.data.chat.id}`);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="send">
          {t("messages.sendMessageButton")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t("messages.sendMessageTitle", { name: recipientName })}</DialogTitle>
        <DialogDescription>{t("messages.sendMessageBody", { cost: COIN_COSTS.superMessage })}</DialogDescription>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <Textarea
            required
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("messages.placeholder")}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("profile.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" variant="send" loading={loading} disabled={!content.trim()}>
              {t("messages.send")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
