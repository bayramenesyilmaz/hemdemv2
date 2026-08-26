function toProfileView(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    viewerId: row.viewer_id,
    viewedId: row.viewed_id,
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/profileViewRepository.js").ProfileViewRepository}
 */
export function createSupabaseProfileViewRepository(client) {
  return {
    async recordView(viewerId, viewedId) {
      const { error } = await client
        .from("profile_views")
        .upsert(
          { viewer_id: viewerId, viewed_id: viewedId },
          { onConflict: "viewer_id,viewed_id", ignoreDuplicates: true }
        );
      if (error) throw error;
    },

    async countViews(viewedId) {
      const { count, error } = await client
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("viewed_id", viewedId);
      if (error) throw error;
      return count ?? 0;
    },

    async findViewers(viewedId) {
      const { data, error } = await client
        .from("profile_views")
        .select("*")
        .eq("viewed_id", viewedId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toProfileView);
    },
  };
}
