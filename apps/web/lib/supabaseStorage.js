"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

const AVATARS_BUCKET = "avatars";

/**
 * Avatarı Supabase Storage'daki `avatars` bucket'ına yükler (bkz.
 * `supabase/README.md`) ve herkese açık URL'ini döndürür. Sadece gerçek
 * modda kullanılır — mock modda `ProfileEditForm` dosyayı doğrudan
 * data URL'e çevirip kullanır.
 *
 * @param {File} file
 * @param {string} userId
 * @returns {Promise<string>}
 */
export async function uploadAvatar(file, userId) {
  const supabase = getSupabaseBrowserClient();
  const extension = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(AVATARS_BUCKET).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
