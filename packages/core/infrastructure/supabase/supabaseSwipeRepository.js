function toSwipe(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    fromUser: row.from_user,
    toUser: row.to_user,
    action: row.action,
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/swipeRepository.js").SwipeRepository}
 */
export function createSupabaseSwipeRepository(client) {
  return {
    async findByPair(fromUser, toUser) {
      const { data, error } = await client
        .from("swipes")
        .select("*")
        .eq("from_user", fromUser)
        .eq("to_user", toUser)
        .maybeSingle();
      if (error) throw error;
      return toSwipe(data);
    },

    async create(swipe) {
      const { data, error } = await client
        .from("swipes")
        .upsert(
          {
            from_user: swipe.fromUser,
            to_user: swipe.toUser,
            action: swipe.action,
          },
          { onConflict: "from_user,to_user" }
        )
        .select("*")
        .single();
      if (error) throw error;
      return toSwipe(data);
    },

    async findIncomingLikes(toUser) {
      const { data, error } = await client
        .from("swipes")
        .select("*")
        .eq("to_user", toUser)
        .in("action", ["like", "superlike"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toSwipe);
    },

    async delete(fromUser, toUser) {
      const { error } = await client
        .from("swipes")
        .delete()
        .eq("from_user", fromUser)
        .eq("to_user", toUser);
      if (error) throw error;
    },
  };
}
