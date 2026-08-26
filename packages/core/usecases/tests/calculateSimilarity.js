import { calculateAnswerSimilarity } from "../../domain/entities/test.js";

/**
 * İki kullanıcının aynı testteki cevaplarını karşılaştırıp benzerlik
 * yüzdesini döndürür (sonuç sayfasında kullanılır).
 *
 * @param {object} repositories
 * @param {string} userIdA
 * @param {string} userIdB
 * @param {string} testId
 */
export async function calculateSimilarity(repositories, userIdA, userIdB, testId) {
  const [answerA, answerB] = await Promise.all([
    repositories.test.findAnswer(userIdA, testId),
    repositories.test.findAnswer(userIdB, testId),
  ]);

  if (!answerA || !answerB) {
    return { status: "error", message: "answers_not_found" };
  }

  const similarity = calculateAnswerSimilarity(answerA.userAnswers, answerB.userAnswers);
  return { status: "success", data: { similarity } };
}
