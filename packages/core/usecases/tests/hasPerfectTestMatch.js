import {
  calculateAnswerSimilarity,
  SIMILARITY_DIRECT_MESSAGE,
} from "../../domain/entities/test.js";

/**
 * İki kullanıcının ortak çözdüğü herhangi bir testte tam uyum (%100)
 * yakalayıp yakalamadığını söyler. Tam uyum, eşleşme beklemeden ve coin
 * harcamadan doğrudan mesaj gönderme hakkı verir — uygulamanın temel
 * vaadi olan "aynı şekilde düşünen insanla tanış" akışının karşılığı.
 *
 * @param {object} repositories
 * @param {string} userIdA
 * @param {string} userIdB
 * @returns {Promise<boolean>}
 */
export async function hasPerfectTestMatch(repositories, userIdA, userIdB) {
  const answersA = await repositories.test.findAnswersByUser(userIdA);
  if (answersA.length === 0) return false;

  for (const answerA of answersA) {
    const answerB = await repositories.test.findAnswer(userIdB, answerA.testId);
    if (!answerB) continue;

    const similarity = calculateAnswerSimilarity(answerA.userAnswers, answerB.userAnswers);
    if (similarity >= SIMILARITY_DIRECT_MESSAGE) return true;
  }

  return false;
}
