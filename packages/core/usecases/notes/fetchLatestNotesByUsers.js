/**
 * @param {object} repositories
 * @param {string[]} userIds
 */
export async function fetchLatestNotesByUsers(repositories, userIds) {
  const notesByUser = await repositories.note.findLatestByUsers(userIds);
  return { status: "success", data: notesByUser };
}
