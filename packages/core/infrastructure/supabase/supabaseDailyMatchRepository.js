function toDailyMatch(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    matchedUserId: row.matched_user_id,
    matchedDate: row.matched_date,
    createdAt: row.created_at,
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/dailyMatchRepository.js").DailyMatchRepository}
 */
export function createSupabaseDailyMatchRepository(client) {
  return {
    async findByUser(userId) {
      const { data, error } = await client
        .from("daily_matches")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return toDailyMatch(data);
    },

    async upsert({ userId, matchedUserId, matchedDate }) {
      const { data, error } = await client
        .from("daily_matches")
        .upsert(
          { user_id: userId, matched_user_id: matchedUserId, matched_date: matchedDate },
          { onConflict: "user_id" }
        )
        .select("*")
        .single();
      if (error) throw error;
      return toDailyMatch(data);
    },
  };
}
