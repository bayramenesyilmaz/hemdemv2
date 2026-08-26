"use client";

import { useState } from "react";
import { useI18n } from "@/locales/client";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { createNoteAction, updateNoteAction, deleteNoteAction } from "@/lib/actions/noteActions";

export function NotesList({ initialNotes }) {
  const t = useI18n();
  const [notes, setNotes] = useState(initialNotes);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createNoteAction(newText);
    setLoading(false);

    if (result.status === "error") {
      setError(t(`notes.errors.${result.message}`));
      return;
    }

    setNotes((prev) => [result.data, ...prev]);
    setNewText("");
  }

  function startEditing(note) {
    setEditingId(note.id);
    setEditText(note.text);
    setError(null);
  }

  async function handleSaveEdit(noteId) {
    setError(null);
    const result = await updateNoteAction(noteId, editText);
    if (result.status === "error") {
      setError(t(`notes.errors.${result.message}`));
      return;
    }
    setNotes((prev) => prev.map((note) => (note.id === noteId ? result.data : note)));
    setEditingId(null);
  }

  async function handleDelete(noteId) {
    await deleteNoteAction(noteId);
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <Textarea
            required
            rows={3}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={t("notes.placeholder")}
          />
          {error && !editingId && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="add" disabled={loading || !newText.trim()} className="self-end">
            {t("notes.add")}
          </Button>
        </form>
      </SectionCard>

      {notes.length === 0 ? (
        <EmptyState title={t("notes.emptyTitle")} description={t("notes.emptyBody")} />
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) =>
            editingId === note.id ? (
              <SectionCard key={note.id} className="flex flex-col gap-3">
                <Textarea rows={3} value={editText} onChange={(e) => setEditText(e.target.value)} />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                    {t("profile.cancel")}
                  </Button>
                  <Button type="button" variant="confirm" onClick={() => handleSaveEdit(note.id)}>
                    {t("notes.save")}
                  </Button>
                </div>
              </SectionCard>
            ) : (
              <SectionCard key={note.id} className="flex flex-col gap-2">
                <p className="whitespace-pre-wrap text-foreground">{note.text}</p>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="edit" onClick={() => startEditing(note)}>
                    {t("notes.edit")}
                  </Button>
                  <Button type="button" variant="delete" onClick={() => handleDelete(note.id)}>
                    {t("notes.delete")}
                  </Button>
                </div>
              </SectionCard>
            )
          )}
        </div>
      )}
    </div>
  );
}
