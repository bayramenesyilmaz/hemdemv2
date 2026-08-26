/**
 * @param {object} repositories
 * @param {string} userId
 * @param {string} noteId
 */
export async function deleteNote(repositories, userId, noteId) {
  const notes = await repositories.note.findByUser(userId);
  if (!notes.some((note) => note.id === noteId)) {
    return { status: "error", message: "note_not_found" };
  }

  await repositories.note.delete(noteId, userId);
  return { status: "success" };
}
