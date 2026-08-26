import {
  calculateAnswerSimilarity,
  SIMILARITY_DIRECT_MESSAGE,
} from "../../domain/entities/test.js";

/**
 * Sonuç sayfası için: kullanıcının kendi cevabını ve testi çözmüş diğer
 * herkesi uyum yüzdesiyle (büyükten küçüğe) döndürür. Testin amacı budur
 * — puan değil, "benim gibi cevaplayan kim?" sorusunun cevabı.
 *
 * `canDirectMessage`: tam uyumda (%100) eşleşme beklemeden doğrudan
 * mesaj gönderilebilir (bkz. usecases/chat/sendMessage).
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

  const others = (await repositories.test.findAnswersByTest(testId)).filter(
    (answer) => answer.userId !== userId
  );

  const profiles = await Promise.all(
    others.map((answer) => repositories.user.findById(answer.userId))
  );

  const matches = others
    .map((answer, index) => {
      const similarity = calculateAnswerSimilarity(ownAnswer.userAnswers, answer.userAnswers);
      return {
        profile: profiles[index],
        similarity,
        canDirectMessage: similarity >= SIMILARITY_DIRECT_MESSAGE,
      };
    })
    .filter((entry) => entry.profile && !entry.profile.isBanned)
    .sort((a, b) => b.similarity - a.similarity);

  return { status: "success", data: { test, ownAnswer, matches } };
}
