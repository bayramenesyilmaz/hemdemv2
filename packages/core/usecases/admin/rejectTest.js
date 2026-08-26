/**
 * Reddedilen bir test, onaylanmayı bekleyen kuyruğa asla geri
 * dönmeyeceği için soft-delete ile işaretlenir (silinen bir testle
 * aynı görünürlük kuralına tabi olur).
 *
 * @param {object} repositories
 * @param {string} callerId
 * @param {string} testId
 */
export async function rejectTest(repositories, callerId, testId) {
  const caller = await repositories.user.findById(callerId);
  if (!caller || caller.role !== "admin") {
    return { status: "error", message: "not_authorized" };
  }

  const test = await repositories.test.findById(testId);
  if (!test) {
    return { status: "error", message: "test_not_found" };
  }

  await repositories.test.softDelete(testId);
  return { status: "success" };
}
