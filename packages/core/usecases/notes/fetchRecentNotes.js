/**
 * Gönderi paylaşıp paylaşmadığına bakılmaksızın, sistem genelinde en
 * güncel notları getirir — Instagram Not'ta olduğu gibi not rail'i
 * gönderi akışından bağımsızdır.
 *
 * @param {object} repositories
 * @param {number} limit
 */
export async function fetchRecentNotes(repositories, limit) {
  const notes = await repositories.note.findRecent(limit);
  return { status: "success", data: notes };
}
