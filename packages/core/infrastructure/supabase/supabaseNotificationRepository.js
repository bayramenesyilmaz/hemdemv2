function toNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    userId: row.user_id,
    type: row.type,
    actorId: row.actor_id,
    testId: row.test_id,
    similarity: row.similarity,
    isRead: row.is_read,
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/notificationRepository.js").NotificationRepository}
 */
export function createSupabaseNotificationRepository(client) {
  return {
    async create(notification) {
      const { data, error } = await client
        .from("notifications")
        .insert({
          user_id: notification.userId,
          type: notification.type,
          actor_id: notification.actorId ?? null,
          test_id: notification.testId ?? null,
          similarity: notification.similarity ?? null,
        })
        .select("*")
        .single();
      if (error) throw error;
      return toNotification(data);
    },

    async findByUser(userId, limit = 50) {
      const { data, error } = await client
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map(toNotification);
    },

    async countUnread(userId, filter = {}) {
      let query = client
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (filter.type) query = query.eq("type", filter.type);
      if (filter.excludeType) query = query.neq("type", filter.excludeType);
      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    },

    async countUnreadSummary(userId) {
      const { data, error } = await client
        .from("notifications")
        .select("type")
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) throw error;
      const rows = data ?? [];
      const message = rows.filter((row) => row.type === "message").length;
      return { general: rows.length - message, message };
    },

    async markAllRead(userId, filter = {}) {
      let query = client.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
      if (filter.type) query = query.eq("type", filter.type);
      if (filter.excludeType) query = query.neq("type", filter.excludeType);
      const { error } = await query;
      if (error) throw error;
    },
  };
}
