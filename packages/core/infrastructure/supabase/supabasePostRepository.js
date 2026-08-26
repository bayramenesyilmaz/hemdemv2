function toPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    userId: row.user_id,
    content: row.content,
    taggedTestId: row.tagged_test_id,
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/postRepository.js").PostRepository}
 */
export function createSupabasePostRepository(client) {
  return {
    async create(post) {
      const { data, error } = await client
        .from("posts")
        .insert({
          user_id: post.userId,
          content: post.content,
          tagged_test_id: post.taggedTestId ?? null,
        })
        .select("*")
        .single();
      if (error) throw error;
      return toPost(data);
    },

    async findFeed(limit = 20, before) {
      let query = client
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (before) query = query.lt("created_at", before);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(toPost);
    },

    async findById(id) {
      const { data, error } = await client.from("posts").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return toPost(data);
    },

    async deleteOwn(id, userId) {
      const { error } = await client
        .from("posts")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
  };
}
