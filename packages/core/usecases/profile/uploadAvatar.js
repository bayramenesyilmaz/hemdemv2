const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Profil fotoğrafını Storage'a yükler ve profili yeni URL ile günceller.
 * Önceden bu, tarayıcıdan doğrudan anon key ile Supabase Storage'a
 * yazıyordu — bucket'ta bir yazma (INSERT) policy'si olmadığı sürece
 * bu her zaman reddedilir (uygulamanın geri kalanının aksine, burada
 * RLS'i bypass eden service-role client kullanılmıyordu). Artık diğer
 * her yazma işlemi gibi server action üzerinden, service-role client
 * ile yükleniyor — bucket'ın "public read" olması yeterli, ayrı bir
 * yazma policy'si gerekmiyor.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {File | Blob} file
 * @param {{ type: string, size: number, extension: string }} meta
 */
export async function uploadAvatar(repositories, userId, file, meta) {
  if (!ALLOWED_TYPES.includes(meta.type)) {
    return { status: "error", message: "invalid_file_type" };
  }
  if (meta.size > MAX_SIZE_BYTES) {
    return { status: "error", message: "file_too_large" };
  }

  const avatarUrl = await repositories.storage.uploadAvatar(userId, file, meta.extension);
  const profile = await repositories.user.update(userId, { avatarUrl });
  return { status: "success", data: profile };
}
