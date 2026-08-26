"use server";

import { createNote } from "@hemdem/core/usecases/notes/createNote";
import { updateNote } from "@hemdem/core/usecases/notes/updateNote";
import { deleteNote } from "@hemdem/core/usecases/notes/deleteNote";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

/**
 * @param {string} text
 */
export async function createNoteAction(text) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return createNote(repositories, userId, text);
}

/**
 * @param {string} noteId
 * @param {string} text
 */
export async function updateNoteAction(noteId, text) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return updateNote(repositories, userId, noteId, text);
}

/**
 * @param {string} noteId
 */
export async function deleteNoteAction(noteId) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return deleteNote(repositories, userId, noteId);
}
