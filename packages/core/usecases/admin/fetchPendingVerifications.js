/**
 * @param {object} repositories
 * @param {string} callerId
 */
export async function fetchPendingVerifications(repositories, callerId) {
  const caller = await repositories.user.findById(callerId);
  if (!caller || caller.role !== "admin") {
    return { status: "error", message: "not_authorized" };
  }

  const profiles = await repositories.user.findMany({ verificationStatus: "pending" });
  return { status: "success", data: profiles };
}
