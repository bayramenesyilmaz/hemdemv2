"use client";

import { useState } from "react";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { CloseIcon, PlusIcon } from "@/components/icons";
import { PostComposer } from "./PostComposer";

/**
 * Gönderi oluşturma formu artık sayfada her zaman açık durmuyor — bir
 * tetikleyici butonla tam ekran modal olarak açılıyor. Daha minimal bir
 * gönderiler sayfası için (bkz. plan: "Durumlar"/"Gönderiler" bölümleri
 * zaten yeterince yer kaplıyordu).
 */
export function PostComposerDialog({ locale, author }) {
  const t = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="add" className="w-full">
          <PlusIcon className="size-4" />
          {t("posts.newPostButton")}
        </Button>
      </DialogTrigger>
      <DialogContent variant="full">
        <div className="flex items-center justify-between gap-3">
          <DialogTitle>{t("posts.newPostButton")}</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              aria-label={t("nav.close")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </DialogClose>
        </div>
        <div className="mt-4">
          <PostComposer locale={locale} author={author} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
