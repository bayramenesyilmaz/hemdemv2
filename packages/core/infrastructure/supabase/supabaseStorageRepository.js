const AVATARS_BUCKET = "avatars";

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @returns {import("../../domain/repositories/storageRepository.js").StorageRepository}
 */
export function createSupabaseStorageRepository(client) {
  return {
    async uploadAvatar(userId, file, extension) {
      const path = `${userId}/${Date.now()}.${extension}`;

      const { error } = await client.storage.from(AVATARS_BUCKET).upload(path, file, { upsert: true });
      if (error) throw error;

      const { data } = client.storage.from(AVATARS_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    },
  };
}
