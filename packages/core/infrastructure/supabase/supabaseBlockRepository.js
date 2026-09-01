function toBlock(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    blockerId: row.blocker_id,
    blockedId: row.blocked_id,
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/blockRepository.js").BlockRepository}
 */
export function createSupabaseBlockRepository(client) {
  return {
    async create(blockerId, blockedId) {
      const { data, error } = await client
        .from("user_blocks")
        .upsert(
          { blocker_id: blockerId, blocked_id: blockedId },
          { onConflict: "blocker_id,blocked_id" }
        )
        .select("*")
        .single();
      if (error) throw error;
      return toBlock(data);
    },

    async delete(blockerId, blockedId) {
      const { error } = await client
        .from("user_blocks")
        .delete()
        .eq("blocker_id", blockerId)
        .eq("blocked_id", blockedId);
      if (error) throw error;
    },

    async exists(blockerId, blockedId) {
      const { data, error } = await client
        .from("user_blocks")
        .select("id")
        .eq("blocker_id", blockerId)
        .eq("blocked_id", blockedId)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },

    async findBlockedIds(userId) {
      const { data, error } = await client.from("user_blocks").select("blocked_id").eq("blocker_id", userId);
      if (error) throw error;
      return (data ?? []).map((row) => row.blocked_id);
    },

    async findRelatedIds(userId) {
      const { data, error } = await client
        .from("user_blocks")
        .select("blocker_id,blocked_id")
        .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
      if (error) throw error;
      const ids = new Set();
      for (const row of data ?? []) {
        ids.add(row.blocker_id === userId ? row.blocked_id : row.blocker_id);
      }
      return [...ids];
    },
  };
}
