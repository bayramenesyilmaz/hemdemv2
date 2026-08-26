/**
 * @param {object} repositories
 * @param {string} callerId
 * @param {{ search?: string }} [filters]
 */
export async function fetchAdminUsers(repositories, callerId, filters = {}) {
  const caller = await repositories.user.findById(callerId);
  if (!caller || caller.role !== "admin") {
    return { status: "error", message: "not_authorized" };
  }

  const users = await repositories.user.findMany(filters);
  return { status: "success", data: users };
}
