/**
 * @param {object} repositories
 * @param {string} userId
 */
export async function fetchNotes(repositories, userId) {
  const notes = await repositories.note.findByUser(userId);
  return { status: "success", data: notes };
}
