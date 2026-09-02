const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Doğrulama fotoğrafını Storage'a yükler (uploadAvatar usecase'iyle aynı
 * storage.uploadAvatar çağrısı, sadece profildeki hedef alanlar farklı) ve
 * profili "pending" durumuna alır — asıl onay/red admin panelinden gelir,
 * bu usecase sadece isteği kuyruğa sokar.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {File | Blob | string} file
 * @param {{ type: string, size: number, extension: string }} meta
 */
export async function submitVerificationPhoto(repositories, userId, file, meta) {
  if (!ALLOWED_TYPES.includes(meta.type)) {
    return { status: "error", message: "invalid_file_type" };
  }
  if (meta.size > MAX_SIZE_BYTES) {
    return { status: "error", message: "file_too_large" };
  }

  const existing = await repositories.user.findById(userId);
  if (!existing) {
    return { status: "error", message: "profile_not_found" };
  }
  if (existing.verificationStatus === "pending" || existing.verificationStatus === "approved") {
    return { status: "error", message: "verification_already_submitted" };
  }

  const verificationPhotoUrl = await repositories.storage.uploadAvatar(userId, file, meta.extension);
  const profile = await repositories.user.update(userId, {
    verificationPhotoUrl,
    verificationStatus: "pending",
  });
  return { status: "success", data: profile };
}
