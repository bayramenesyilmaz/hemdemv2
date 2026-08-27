/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/leaderboardRewardRepository.js").LeaderboardRewardRepository}
 */
export function createSupabaseLeaderboardRewardRepository(client) {
  return {
    async hasGranted(periodType, periodKey) {
      const { data, error } = await client
        .from("leaderboard_reward_grants")
        .select("id")
        .eq("period_type", periodType)
        .eq("period_key", periodKey)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },

    async recordGrant(periodType, periodKey, userId, rank, coins) {
      const { error } = await client.from("leaderboard_reward_grants").insert({
        period_type: periodType,
        period_key: periodKey,
        user_id: userId,
        rank,
        coins,
      });
      if (error) throw error;
    },
  };
}
