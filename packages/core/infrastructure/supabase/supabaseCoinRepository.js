/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/coinRepository.js").CoinRepository}
 */
export function createSupabaseCoinRepository(client) {
  return {
    async getBalance(userId) {
      const { data, error } = await client
        .from("user_coins")
        .select("coin")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data?.coin ?? 0;
    },

    async increment(userId, amount) {
      const { data, error } = await client.rpc("increment_coin", {
        p_user_id: userId,
        p_amount: amount,
      });
      if (error) throw error;
      return data;
    },

    async decrementIfSufficient(userId, amount) {
      const { data, error } = await client.rpc("decrement_coin_if_sufficient", {
        p_user_id: userId,
        p_amount: amount,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return { ok: row?.ok ?? false, newBalance: row?.new_balance ?? 0 };
    },
  };
}
