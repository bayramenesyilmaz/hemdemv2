import { validateTest } from "../../domain/entities/test.js";
import { COIN_COSTS } from "../../domain/entities/coin.js";
import { findProfanityMatches } from "../../domain/entities/moderation.js";

function collectTestText(testInput) {
  return [
    testInput.title,
    ...(testInput.questions ?? []).flatMap((q) => [q.text, ...(q.options ?? []).map((o) => o.text)]),
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Kendi test oluşturma 300 coin karşılığındadır. Coin yetersizse test
 * hiç oluşturulmaz; oluşturma başarısız olursa harcanan coin iade edilir.
 *
 * Testler artık admin onayı beklemeden anında yayınlanır (`approved: true`)
 * — insan onayı süreci çok yavaş/meşakkatli bulunduğu için kaldırıldı,
 * tek savunma hattı `validateTest`'in içindeki içerik filtresi
 * (`containsProfanity`). Admin panelindeki "Test Onayları" sayfası hâlâ
 * duruyor ama artık hiçbir zaman bekleyen bir test göstermeyecek — ileride
 * "şikayet edilen testler" gibi bir moderasyon kuyruğuna dönüştürülebilir.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {object} testInput
 */
export async function createTest(repositories, userId, testInput) {
  const { valid, errors } = validateTest(testInput);
  if (!valid) {
    const data =
      errors[0] === "inappropriate_content" ? { flaggedWords: findProfanityMatches(collectTestText(testInput)) } : undefined;
    return { status: "error", message: errors[0], data };
  }

  const { ok, newBalance } = await repositories.coin.decrementIfSufficient(
    userId,
    COIN_COSTS.createTest
  );
  if (!ok) {
    return { status: "error", message: "insufficient_coins" };
  }

  try {
    const test = await repositories.test.create({ ...testInput, createdBy: userId, approved: true });
    return { status: "success", data: { test, remainingCoins: newBalance } };
  } catch (error) {
    await repositories.coin.increment(userId, COIN_COSTS.createTest);
    throw error;
  }
}
