"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { SectionCard } from "@/components/SectionCard";
import { Avatar } from "@/components/Avatar";
import { AdSlot } from "@/components/AdSlot";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { TrashIcon, TestsIcon } from "@/components/icons";
import { deleteOwnPostAction } from "@/lib/actions/postActions";

/** Akışta kaçıncı gönderiden sonra banner reklam gösterileceği. */
const AD_EVERY = 5;

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
      {entries.map(({ post, author, taggedTest }, index) => (
        <div key={post.id} className="contents">
          <SectionCard
            className="flex animate-list-in flex-col gap-3"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar + isim tek dokunma hedefi (bkz. min-h-11). */}
              <Link
                href={`/${locale}/u/${author.id}`}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-3 font-semibold text-foreground transition-colors hover:text-primary"
              >
                <Avatar src={author.avatarUrl} name={author.name} size="sm" />
                <span className="min-w-0 truncate">{author.name}</span>
              </Link>

              {currentUserId === post.userId && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      disabled={deletingId === post.id}
                      aria-label={t("posts.delete")}
                      className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <TrashIcon className="size-4" />
                    </button>
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

            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{post.content}</p>

            {taggedTest && (
              <Link
                href={`/${locale}/tests/${taggedTest.id}`}
                className="flex items-center gap-3 rounded-2xl bg-gradient-surface p-3 transition-transform active:scale-[0.99]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft">
                  <TestsIcon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{taggedTest.title}</span>
                  <span className="block text-xs text-muted-foreground">{t("posts.solveTagged")}</span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-lg text-primary">
                  →
                </span>
              </Link>
            )}
          </SectionCard>

          {(index + 1) % AD_EVERY === 0 && index + 1 < entries.length && (
            <AdSlot label={t("ads.label")} />
          )}
        </div>
      ))}
    </div>
  );
}
