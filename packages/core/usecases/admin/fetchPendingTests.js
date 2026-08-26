/**
 * @param {object} repositories
 * @param {string} callerId
 */
export async function fetchPendingTests(repositories, callerId) {
  const caller = await repositories.user.findById(callerId);
  if (!caller || caller.role !== "admin") {
    return { status: "error", message: "not_authorized" };
  }

  const tests = await repositories.test.findPendingApproval();
  return { status: "success", data: tests };
}
