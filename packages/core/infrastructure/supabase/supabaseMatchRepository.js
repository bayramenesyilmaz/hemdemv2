import { orderUserPair } from "../../domain/entities/swipe.js";

function toMatch(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    userA: row.user_a,
    userB: row.user_b,
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/matchRepository.js").MatchRepository}
 */
export function createSupabaseMatchRepository(client) {
  return {
    async findByPair(userIdA, userIdB) {
      const [userA, userB] = orderUserPair(userIdA, userIdB);
      const { data, error } = await client
        .from("matches")
        .select("*")
        .eq("user_a", userA)
        .eq("user_b", userB)
        .maybeSingle();
      if (error) throw error;
      return toMatch(data);
    },

    async create(userIdA, userIdB) {
      const [userA, userB] = orderUserPair(userIdA, userIdB);
      const { data, error } = await client
        .from("matches")
        .upsert({ user_a: userA, user_b: userB }, { onConflict: "user_a,user_b" })
        .select("*")
        .single();
      if (error) throw error;
      return toMatch(data);
    },

    async findByUser(userId) {
      const { data, error } = await client
        .from("matches")
        .select("*")
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toMatch);
    },
  };
}
