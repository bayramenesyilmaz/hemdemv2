/**
 * @param {object} repositories
 * @param {string} callerId
 * @param {string} targetUserId
 */
export async function approveVerification(repositories, callerId, targetUserId) {
  const caller = await repositories.user.findById(callerId);
  if (!caller || caller.role !== "admin") {
    return { status: "error", message: "not_authorized" };
  }

  const target = await repositories.user.findById(targetUserId);
  if (!target) {
    return { status: "error", message: "user_not_found" };
  }

  const updated = await repositories.user.update(targetUserId, { verificationStatus: "approved" });
  return { status: "success", data: updated };
}
