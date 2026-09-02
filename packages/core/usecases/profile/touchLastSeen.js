/**
 * Kullanıcının "son görülme" zamanını günceller — çevrimiçi durumu bundan
 * türetilir (bkz. `isOnline`, `packages/core/domain/entities/user.js`).
 * `updateProfile`'ın tam doğrulama akışından geçmez, sadece tek bir alanı
 * dokunur — web/mobil'de düzenli aralıklarla (heartbeat) çağrılır.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function touchLastSeen(repositories, userId) {
  await repositories.user.touchLastSeen(userId);
  return { status: "success" };
}
