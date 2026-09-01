function toRequest(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    userId: row.user_id,
    type: row.type,
    subject: row.subject,
    description: row.description,
    email: row.email,
    targetUserId: row.target_user_id,
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/requestRepository.js").RequestRepository}
 */
export function createSupabaseRequestRepository(client) {
  return {
    async create(request) {
      const { data, error } = await client
        .from("requests")
        .insert({
          user_id: request.userId ?? null,
          type: request.type,
          subject: request.subject,
          description: request.description,
          email: request.email ?? null,
          target_user_id: request.targetUserId ?? null,
        })
        .select("*")
        .single();
      if (error) throw error;
      return toRequest(data);
    },

    async findMany(filters = {}) {
      let query = client.from("requests").select("*").order("created_at", { ascending: false });
      if (filters.type) query = query.eq("type", filters.type);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(toRequest);
    },
  };
}
