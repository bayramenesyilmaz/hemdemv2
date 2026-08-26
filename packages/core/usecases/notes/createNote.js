import { validateNoteText } from "../../domain/entities/note.js";

/**
 * @param {object} repositories
 * @param {string} userId
 * @param {string} text
 */
export async function createNote(repositories, userId, text) {
  const { valid, errors } = validateNoteText(text);
  if (!valid) {
    return { status: "error", message: errors[0] };
  }

  const note = await repositories.note.create({ userId, text });
  return { status: "success", data: note };
}
