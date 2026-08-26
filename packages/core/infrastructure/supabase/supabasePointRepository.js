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
      return data;
    },
  };
}
