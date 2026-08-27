"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n, useCurrentLocale } from "@/locales/client";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";
import { PlusIcon } from "@/components/icons";
import { createNoteAction, updateNoteAction, deleteNoteAction } from "@/lib/actions/noteActions";

const NOTE_MAX_LENGTH = 120;

/**
 * Gönderi akışının en üstünde yatay kaydırmalı profil avatarı satırı
 * (Instagram Hikayeler benzeri). Akıştaki gönderi yazarlarını, en son
 * paylaşandan başlayarak tekilleştirip listeler; her yazarın en güncel
 * notu varsa avatarın üstünde balon rozet olarak gösterir.
 *
 * Rozete dokununca notun tamamı bir sheet'te açılır; avatarın kendisine
 * dokununca her zaman o kişinin profiline gidilir — iki dokunma hedefi
 * kasıtlı olarak ayrı tutuldu.
 */
export function PostAuthorRail({ locale, entries, currentUserId, currentAuthor, notesByAuthor }) {
  const t = useI18n();
  const uiLocale = useCurrentLocale();

  const [notes, setNotes] = useState(notesByAuthor ?? {});
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeError, setComposeError] = useState(null);
  const [composeLoading, setComposeLoading] = useState(false);

  const [activeAuthor, setActiveAuthor] = useState(null);
  const [editText, setEditText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const seen = new Set();
  const authors = [];
  if (currentUserId && currentAuthor) {
    seen.add(currentUserId);
    authors.push(currentAuthor);
  }
  for (const { author } of entries) {
    if (seen.has(author.id)) continue;
    seen.add(author.id);
    authors.push(author);
  }

  if (authors.length === 0) return null;

  function openCompose() {
    setComposeError(null);
    setComposeText(notes[currentUserId]?.text ?? "");
    setComposeOpen(true);
  }

  async function handleCompose(event) {
    event.preventDefault();
    setComposeError(null);
    setComposeLoading(true);
    const result = await createNoteAction(composeText);
    setComposeLoading(false);
    if (result.status === "error") {
      setComposeError(t(`notes.errors.${result.message}`));
      return;
    }
    setNotes((prev) => ({ ...prev, [currentUserId]: result.data }));
    setComposeText("");
    setComposeOpen(false);
  }

  function openNote(author) {
    const note = notes[author.id];
    if (!note) return;
    setActiveAuthor(author);
    setEditText(note.text);
    setIsEditing(false);
    setDetailError(null);
  }

  function closeDetail(open) {
    if (!open) {
      setActiveAuthor(null);
      setIsEditing(false);
      setDetailError(null);
    }
  }

  async function handleSaveEdit() {
    if (!activeAuthor) return;
    const note = notes[activeAuthor.id];
    setDetailError(null);
    setDetailLoading(true);
    const result = await updateNoteAction(note.id, editText);
    setDetailLoading(false);
    if (result.status === "error") {
      setDetailError(t(`notes.errors.${result.message}`));
      return;
    }
    setNotes((prev) => ({ ...prev, [activeAuthor.id]: result.data }));
    setIsEditing(false);
  }

  async function handleDelete() {
    if (!activeAuthor) return;
    const note = notes[activeAuthor.id];
    setDetailLoading(true);
    await deleteNoteAction(note.id);
    setDetailLoading(false);
    setNotes((prev) => {
      const next = { ...prev };
      delete next[activeAuthor.id];
      return next;
    });
    setActiveAuthor(null);
  }

  const activeNote = activeAuthor ? notes[activeAuthor.id] : null;
  const formattedDate = activeNote
    ? new Intl.DateTimeFormat(uiLocale, { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(activeNote.createdAt)
      )
    : null;

  return (
    <>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0" style={{ scrollbarWidth: "none" }}>
        {authors.map((author) => {
          const note = notes[author.id];
          const isCurrentUser = author.id === currentUserId;

          return (
            <div key={author.id} className="flex w-20 shrink-0 flex-col items-center gap-1.5">
              <div className="flex h-9 w-full items-end justify-center">
                {note && (
                  <button
                    type="button"
                    onClick={() => openNote(author)}
                    className="max-w-full truncate rounded-2xl rounded-bl-sm bg-card px-2.5 py-1.5 text-[11px] leading-tight text-card-foreground shadow-soft ring-1 ring-border"
                  >
                    {note.text}
                  </button>
                )}
              </div>

              <div className="relative">
                <Link
                  href={`/${locale}/u/${author.id}`}
                  className="block rounded-full bg-gradient-primary p-[2px]"
                >
                  <Avatar src={author.avatarUrl} name={author.name} size="md" className="ring-2 ring-background" />
                </Link>
                {isCurrentUser && (
                  <button
                    type="button"
                    onClick={openCompose}
                    aria-label={t("notes.leaveNote")}
                    className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background"
                  >
                    <PlusIcon className="size-3" />
                  </button>
                )}
              </div>

              <span className="w-full truncate text-center text-xs text-muted-foreground">{author.name}</span>
            </div>
          );
        })}
      </div>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent>
          <DialogTitle>{t("notes.leaveNote")}</DialogTitle>
          <form onSubmit={handleCompose} className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar src={currentAuthor?.avatarUrl} name={currentAuthor?.name} size="sm" />
              <Textarea
                autoFocus
                required
                rows={2}
                maxLength={NOTE_MAX_LENGTH}
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
                placeholder={t("notes.composePlaceholder")}
                className="flex-1"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {composeText.length}/{NOTE_MAX_LENGTH}
              </span>
              {composeError && <p className="text-sm text-destructive">{composeError}</p>}
            </div>
            <Button type="submit" variant="add" disabled={composeLoading || !composeText.trim()} className="self-end">
              {t("notes.share")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={activeAuthor !== null} onOpenChange={closeDetail}>
        <DialogContent>
          {activeAuthor && activeNote && (
            <>
              <div className="flex items-center gap-3">
                <Link href={`/${locale}/u/${activeAuthor.id}`}>
                  <Avatar src={activeAuthor.avatarUrl} name={activeAuthor.name} size="sm" />
                </Link>
                <div className="min-w-0">
                  <DialogTitle className="text-base">
                    <Link href={`/${locale}/u/${activeAuthor.id}`} className="hover:underline">
                      {activeAuthor.name}
                    </Link>
                  </DialogTitle>
                  <DialogDescription className="mt-0">{formattedDate}</DialogDescription>
                </div>
              </div>

              {isEditing ? (
                <div className="mt-4 flex flex-col gap-3">
                  <Textarea
                    autoFocus
                    rows={3}
                    maxLength={NOTE_MAX_LENGTH}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  {detailError && <p className="text-sm text-destructive">{detailError}</p>}
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      {t("profile.cancel")}
                    </Button>
                    <Button type="button" variant="confirm" disabled={detailLoading} onClick={handleSaveEdit}>
                      {t("notes.save")}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                    {activeNote.text}
                  </p>
                  {activeAuthor.id === currentUserId && (
                    <div className="mt-4 flex justify-end gap-3">
                      <Button type="button" variant="edit" onClick={() => setIsEditing(true)}>
                        {t("notes.edit")}
                      </Button>
                      <Button type="button" variant="delete" disabled={detailLoading} onClick={handleDelete}>
                        {t("notes.delete")}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
