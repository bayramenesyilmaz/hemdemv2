function toNote(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    userId: row.user_id,
    text: row.text,
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/noteRepository.js").NoteRepository}
 */
export function createSupabaseNoteRepository(client) {
  return {
    async findByUser(userId) {
      const { data, error } = await client
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toNote);
    },

    async create(note) {
      const { data, error } = await client
        .from("notes")
        .insert({ user_id: note.userId, text: note.text })
        .select("*")
        .single();
      if (error) throw error;
      return toNote(data);
    },

    async update(id, userId, text) {
      const { data, error } = await client
        .from("notes")
        .update({ text })
        .eq("id", id)
        .eq("user_id", userId)
        .select("*")
        .single();
      if (error) throw error;
      return toNote(data);
    },

    async delete(id, userId) {
      const { error } = await client
        .from("notes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
  };
}
