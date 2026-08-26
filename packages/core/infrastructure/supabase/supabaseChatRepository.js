import { orderUserPair } from "../../domain/entities/swipe.js";

function toChat(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    lastMessageAt: row.last_message_at,
    userA: row.user_a,
    userB: row.user_b,
    source: row.source,
  };
}

function toMessage(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    chatId: row.chat_id,
    senderId: row.sender_id,
    content: row.content,
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/chatRepository.js").ChatRepository}
 */
export function createSupabaseChatRepository(client) {
  return {
    async findByPair(userIdA, userIdB) {
      const [userA, userB] = orderUserPair(userIdA, userIdB);
      const { data, error } = await client
        .from("chats")
        .select("*")
        .eq("user_a", userA)
        .eq("user_b", userB)
        .maybeSingle();
      if (error) throw error;
      return toChat(data);
    },

    async create(chat) {
      const [userA, userB] = orderUserPair(chat.userA, chat.userB);
      const { data, error } = await client
        .from("chats")
        .insert({ user_a: userA, user_b: userB, source: chat.source })
        .select("*")
        .single();
      if (error) throw error;
      return toChat(data);
    },

    async findByUser(userId) {
      const { data, error } = await client
        .from("chats")
        .select("*")
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toChat);
    },

    async findById(chatId) {
      const { data, error } = await client
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .maybeSingle();
      if (error) throw error;
      return toChat(data);
    },

    async touchLastMessageAt(chatId, timestamp) {
      const { error } = await client
        .from("chats")
        .update({ last_message_at: timestamp })
        .eq("id", chatId);
      if (error) throw error;
    },

    async createMessage(chatId, message) {
      const { data, error } = await client
        .from("messages")
        .insert({ chat_id: chatId, sender_id: message.senderId, content: message.content })
        .select("*")
        .single();
      if (error) throw error;
      return toMessage(data);
    },

    async findMessages(chatId, limit = 50, before) {
      let query = client
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (before) query = query.lt("created_at", before);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(toMessage);
    },

    async deleteInactiveChats(cutoffIso) {
      const { data, error } = await client
        .from("chats")
        .delete()
        .lt("last_message_at", cutoffIso)
        .select("id");
      if (error) throw error;
      return (data ?? []).length;
    },
  };
}
