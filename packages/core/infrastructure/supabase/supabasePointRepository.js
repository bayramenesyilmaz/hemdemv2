/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/pointRepository.js").PointRepository}
 */
export function createSupabasePointRepository(client) {
  return {
    async getBalance(userId) {
      const { data, error } = await client
        .from("user_points")
        .select("point")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data?.point ?? 0;
    },

    async increment(userId, amount) {
      const { data, error } = await client.rpc("increment_point", {
        p_user_id: userId,
        p_amount: amount,
      });
      if (error) throw error;

      const { error: eventError } = await client
        .from("point_events")
        .insert({ user_id: userId, points: amount });
      if (eventError) throw eventError;

      return data;
    },

    async findWindowedLeaderboard(windowMs, limit = 20) {
      const cutoff = new Date(Date.now() - windowMs).toISOString();
      const { data, error } = await client
        .from("point_events")
        .select("user_id, points")
        .gte("created_at", cutoff);
      if (error) throw error;

      const totals = new Map();
      for (const row of data ?? []) {
        totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + row.points);
      }
      return [...totals.entries()]
        .map(([userId, point]) => ({ userId, point }))
        .sort((a, b) => b.point - a.point)
        .slice(0, limit);
    },
  };
}
