import { calculateAnswerSimilarity } from "../../domain/entities/test.js";

/**
 * Sonuç sayfası için: kullanıcının kendi cevabını ve testi daha önce
 * çözmüş diğer herkesle benzerlik yüzdesini (büyükten küçüğe sıralı)
 * döndürür.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {string} testId
 */
export async function fetchTestResults(repositories, userId, testId) {
  const test = await repositories.test.findById(testId);
  if (!test) {
    return { status: "error", message: "test_not_found" };
  }

  const ownAnswer = await repositories.test.findAnswer(userId, testId);
  if (!ownAnswer) {
    return { status: "error", message: "not_answered_yet" };
  }

  const allAnswers = await repositories.test.findAnswersByTest(testId);
  const comparisons = allAnswers
    .filter((answer) => answer.userId !== userId)
    .map((answer) => ({
      userId: answer.userId,
      similarity: calculateAnswerSimilarity(ownAnswer.userAnswers, answer.userAnswers),
    }))
    .sort((a, b) => b.similarity - a.similarity);

  return { status: "success", data: { test, ownAnswer, comparisons } };
}
