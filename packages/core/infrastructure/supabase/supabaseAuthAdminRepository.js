/**
 * `auth.users` satırını silmek `public.profiles` üzerindeki
 * `on delete cascade` FK'sı sayesinde tüm bağlı verileri (answers, swipes,
 * matches, chats, posts, notes, ...) otomatik temizler — ayrıca
 * `profiles` satırını elle silmeye gerek yoktur.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/authAdminRepository.js").AuthAdminRepository}
 */
export function createSupabaseAuthAdminRepository(client) {
  return {
    async deleteUser(userId) {
      const { error } = await client.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
  };
}
