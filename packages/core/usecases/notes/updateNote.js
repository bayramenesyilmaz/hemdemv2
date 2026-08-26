import { validateNoteText } from "../../domain/entities/note.js";

/**
 * @param {object} repositories
 * @param {string} userId
 * @param {string} noteId
 * @param {string} text
 */
export async function updateNote(repositories, userId, noteId, text) {
  const { valid, errors } = validateNoteText(text);
  if (!valid) {
    return { status: "error", message: errors[0] };
  }

  const notes = await repositories.note.findByUser(userId);
  if (!notes.some((note) => note.id === noteId)) {
    return { status: "error", message: "note_not_found" };
  }

  const note = await repositories.note.update(noteId, userId, text);
  return { status: "success", data: note };
}
