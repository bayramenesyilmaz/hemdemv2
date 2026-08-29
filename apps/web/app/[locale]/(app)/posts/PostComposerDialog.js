"use client";

import { useState } from "react";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { PlusIcon } from "@/components/icons";
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
        <DialogTitle>{t("posts.newPostButton")}</DialogTitle>
        <div className="mt-4">
          <PostComposer locale={locale} author={author} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
