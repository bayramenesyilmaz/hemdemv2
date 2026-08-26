"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { deleteOwnPostAction } from "@/lib/actions/postActions";

export function PostFeedList({ locale, entries, currentUserId }) {
  const t = useI18n();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(postId) {
    setDeletingId(postId);
    await deleteOwnPostAction(postId);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map(({ post, author, taggedTest }) => (
        <SectionCard key={post.id} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <Link href={`/${locale}/u/${author.id}`} className="font-medium text-foreground underline">
              {author.name}
            </Link>

            {currentUserId === post.userId && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="delete" disabled={deletingId === post.id}>
                    {t("posts.delete")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>{t("posts.deleteConfirmTitle")}</DialogTitle>
                  <DialogDescription>{t("posts.deleteConfirmBody")}</DialogDescription>
                  <div className="mt-4 flex justify-end gap-3">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        {t("profile.cancel")}
                      </Button>
                    </DialogClose>
                    <Button type="button" variant="delete" onClick={() => handleDelete(post.id)}>
                      {t("posts.deleteConfirmAction")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <p className="whitespace-pre-wrap text-foreground">{post.content}</p>

          {taggedTest && (
            <Link
              href={`/${locale}/tests/${taggedTest.id}`}
              className="w-fit rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground underline"
            >
              {taggedTest.title}
            </Link>
          )}
        </SectionCard>
      ))}
    </div>
  );
}
