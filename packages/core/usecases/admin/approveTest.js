/**
 * @param {object} repositories
 * @param {string} callerId
 * @param {string} testId
 */
export async function approveTest(repositories, callerId, testId) {
  const caller = await repositories.user.findById(callerId);
  if (!caller || caller.role !== "admin") {
    return { status: "error", message: "not_authorized" };
  }

  const test = await repositories.test.findById(testId);
  if (!test) {
    return { status: "error", message: "test_not_found" };
  }

  const updated = await repositories.test.update(testId, { approved: true });
  return { status: "success", data: updated };
}
