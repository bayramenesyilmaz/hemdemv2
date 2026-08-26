/**
 * Bir testi sadece onu oluşturan kullanıcı silebilir — bu kontrol
 * bilerek repository katmanında değil, burada (usecase) yapılır.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {string} testId
 */
export async function deleteOwnTest(repositories, userId, testId) {
  const test = await repositories.test.findById(testId);
  if (!test) {
    return { status: "error", message: "test_not_found" };
  }
  if (test.createdBy !== userId) {
    return { status: "error", message: "not_owner" };
  }

  await repositories.test.softDelete(testId);
  return { status: "success" };
}
