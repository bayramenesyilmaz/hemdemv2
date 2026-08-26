/**
 * Bir teste cevap gönderir. Her kullanıcı bir testi yalnızca bir kez
 * çözebilir (answers tablosunda unique(user_id,test_id)). Testin puanı
 * varsa çözen kullanıcının liderlik tablosu puanına eklenir.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {string} testId
 * @param {{ questionId: string, choiceId: string }[]} userAnswers
 */
export async function submitAnswers(repositories, userId, testId, userAnswers) {
  const test = await repositories.test.findById(testId);
  if (!test) {
    return { status: "error", message: "test_not_found" };
  }

  const existing = await repositories.test.findAnswer(userId, testId);
  if (existing) {
    return { status: "error", message: "already_answered" };
  }

  const answer = await repositories.test.saveAnswer({ userId, testId, userAnswers });

  if (test.point > 0) {
    await repositories.point.increment(userId, test.point);
  }

  return { status: "success", data: answer };
}
