"use client";

import { useState } from "react";
import { useI18n, useCurrentLocale } from "@/locales/client";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";
import { PlusIcon } from "@/components/icons";
import { createNoteAction, updateNoteAction, deleteNoteAction } from "@/lib/actions/noteActions";

const NOTE_MAX_LENGTH = 120;
const BUBBLE_PREVIEW_LENGTH = 28;

function truncate(text, length) {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

/** Instagram "Not" balonu: avatarın üstünde konuşma balonu şeklinde metin önizlemesi. */
function NoteBubble({ note, author, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-center"
    >
      <span className="relative flex flex-col items-center">
        <span className="relative mb-1 max-w-[7.5rem] rounded-2xl rounded-bl-sm bg-card px-3 py-2 text-xs leading-snug text-card-foreground shadow-soft ring-1 ring-border">
          {truncate(note.text, BUBBLE_PREVIEW_LENGTH)}
        </span>
        <span className="rounded-full bg-gradient-primary p-[2px]">
          <Avatar src={author?.avatarUrl} name={author?.name} size="md" className="ring-2 ring-background" />
        </span>
      </span>
    </button>
  );
}

function ComposeBubble({ author, t, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-center"
    >
      <span className="relative">
        <Avatar src={author?.avatarUrl} name={author?.name} size="md" className="ring-2 ring-background" />
        <span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
          <PlusIcon className="size-3" />
        </span>
      </span>
      <span className="truncate text-xs font-medium text-foreground">{t("notes.leaveNote")}</span>
    </button>
  );
}

export function NotesList({ initialNotes, author }) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const [notes, setNotes] = useState(initialNotes);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeError, setComposeError] = useState(null);
  const [composeLoading, setComposeLoading] = useState(false);

  const [activeNote, setActiveNote] = useState(null);
  const [editText, setEditText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
    setNotes((prev) => [result.data, ...prev]);
    setComposeText("");
    setComposeOpen(false);
  }

  function openNote(note) {
    setActiveNote(note);
    setEditText(note.text);
    setIsEditing(false);
    setDetailError(null);
  }

  function closeDetail(open) {
    if (!open) {
      setActiveNote(null);
      setIsEditing(false);
      setDetailError(null);
    }
  }

  async function handleSaveEdit() {
    if (!activeNote) return;
    setDetailError(null);
    setDetailLoading(true);
    const result = await updateNoteAction(activeNote.id, editText);
    setDetailLoading(false);
    if (result.status === "error") {
      setDetailError(t(`notes.errors.${result.message}`));
      return;
    }
    setNotes((prev) => prev.map((note) => (note.id === activeNote.id ? result.data : note)));
    setActiveNote(result.data);
    setIsEditing(false);
  }

  async function handleDelete() {
    if (!activeNote) return;
    setDetailLoading(true);
    await deleteNoteAction(activeNote.id);
    setDetailLoading(false);
    setNotes((prev) => prev.filter((note) => note.id !== activeNote.id));
    setActiveNote(null);
  }

  const formattedDate = activeNote
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(activeNote.createdAt)
      )
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0" style={{ scrollbarWidth: "none" }}>
        <ComposeBubble author={author} t={t} onClick={() => setComposeOpen(true)} />
        {notes.map((note) => (
          <NoteBubble key={note.id} note={note} author={author} onClick={() => openNote(note)} />
        ))}
      </div>

      {notes.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">{t("notes.emptyHint")}</p>
      )}

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent>
          <DialogTitle>{t("notes.leaveNote")}</DialogTitle>
          <form onSubmit={handleCompose} className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar src={author?.avatarUrl} name={author?.name} size="sm" />
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

      <Dialog open={activeNote !== null} onOpenChange={closeDetail}>
        <DialogContent>
          {activeNote && (
            <>
              <div className="flex items-center gap-3">
                <Avatar src={author?.avatarUrl} name={author?.name} size="sm" />
                <div className="min-w-0">
                  <DialogTitle className="text-base">{author?.name ?? t("notes.yourNote")}</DialogTitle>
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
                  <div className="mt-4 flex justify-end gap-3">
                    <Button type="button" variant="edit" onClick={() => setIsEditing(true)}>
                      {t("notes.edit")}
                    </Button>
                    <Button type="button" variant="delete" disabled={detailLoading} onClick={handleDelete}>
                      {t("notes.delete")}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
