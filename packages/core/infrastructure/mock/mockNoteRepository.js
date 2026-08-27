/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/noteRepository.js").NoteRepository}
 */
export function createMockNoteRepository(store) {
  return {
    async findByUser(userId) {
      return (store.notes.get(userId) ?? []).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },

    async findLatestByUsers(userIds) {
      const result = {};
      for (const userId of userIds) {
        const list = store.notes.get(userId) ?? [];
        if (list.length === 0) continue;
        result[userId] = list.reduce((latest, note) => (note.createdAt > latest.createdAt ? note : latest));
      }
      return result;
    },

    async create(note) {
      const full = {
        id: `note-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...note,
      };
      const list = store.notes.get(note.userId) ?? [];
      list.push(full);
      store.notes.set(note.userId, list);
      return full;
    },

    async update(id, userId, text) {
      const list = store.notes.get(userId) ?? [];
      const note = list.find((n) => n.id === id);
      if (!note) throw new Error("mock_note_not_found");
      note.text = text;
      return note;
    },

    async delete(id, userId) {
      const list = store.notes.get(userId) ?? [];
      store.notes.set(
        userId,
        list.filter((n) => n.id !== id)
      );
    },
  };
}
