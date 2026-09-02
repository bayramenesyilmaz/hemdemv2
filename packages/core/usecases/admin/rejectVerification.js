/**
 * Reddedilen bir doğrulama testteki soft-delete deseninden farklı olarak
 * kalıcı değil — kullanıcı yeni bir fotoğrafla yeniden başvurabilsin diye
 * sadece "rejected" durumuna alınır (bkz. migration'daki tri-state kolon
 * gerekçesi).
 *
 * @param {object} repositories
 * @param {string} callerId
 * @param {string} targetUserId
 */
export async function rejectVerification(repositories, callerId, targetUserId) {
  const caller = await repositories.user.findById(callerId);
  if (!caller || caller.role !== "admin") {
    return { status: "error", message: "not_authorized" };
  }

  const target = await repositories.user.findById(targetUserId);
  if (!target) {
    return { status: "error", message: "user_not_found" };
  }

  const updated = await repositories.user.update(targetUserId, { verificationStatus: "rejected" });
  return { status: "success", data: updated };
}
