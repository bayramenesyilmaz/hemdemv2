/**
 * @param {object} repositories
 * @param {string} callerId
 * @param {{ type?: "complaint" | "request" }} [filters]
 */
export async function fetchSupportRequests(repositories, callerId, filters = {}) {
  const caller = await repositories.user.findById(callerId);
  if (!caller || caller.role !== "admin") {
    return { status: "error", message: "not_authorized" };
  }

  const requests = await repositories.request.findMany(filters);
  return { status: "success", data: requests };
}
