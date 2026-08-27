import { NOTE_LIFETIME_MS } from "../../domain/entities/note.js";

function noteCutoffIso() {
  return new Date(Date.now() - NOTE_LIFETIME_MS).toISOString();
}

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
        .gte("created_at", noteCutoffIso())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toNote);
    },

    async findRecent(limit) {
      // Bir kullanıcının birden fazla notu olabileceği için (dünkü + bugünkü
      // gibi) her kullanıcı başına tek satır garantilemek adına gerekenden
      // fazla satır çekilip JS'te kullanıcı başına ilk (en yeni) satır
      // tutuluyor — findLatestByUsers'daki aynı teknik.
      const { data, error } = await client
        .from("notes")
        .select("*")
        .gte("created_at", noteCutoffIso())
        .order("created_at", { ascending: false })
        .limit(limit * 5);
      if (error) throw error;

      const seen = new Set();
      const result = [];
      for (const row of data ?? []) {
        const note = toNote(row);
        if (seen.has(note.userId)) continue;
        seen.add(note.userId);
        result.push(note);
        if (result.length >= limit) break;
      }
      return result;
    },

    async findLatestByUsers(userIds) {
      if (userIds.length === 0) return {};
      const { data, error } = await client
        .from("notes")
        .select("*")
        .in("user_id", userIds)
        .gte("created_at", noteCutoffIso())
        .order("created_at", { ascending: false });
      if (error) throw error;

      const result = {};
      for (const row of data ?? []) {
        const note = toNote(row);
        // En yeniden en eskiye sıralı geldiği için bir kullanıcı için
        // ilk rastlanan satır zaten o kullanıcının en güncel notudur.
        if (!result[note.userId]) result[note.userId] = note;
      }
      return result;
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
