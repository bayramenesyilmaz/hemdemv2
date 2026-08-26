import { validateTest } from "../../domain/entities/test.js";
import { COIN_COSTS } from "../../domain/entities/coin.js";

/**
 * Kendi test oluşturma 300 coin karşılığındadır. Coin yetersizse test
 * hiç oluşturulmaz; oluşturma başarısız olursa harcanan coin iade edilir.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {object} testInput
 */
export async function createTest(repositories, userId, testInput) {
  const { valid, errors } = validateTest(testInput);
  if (!valid) {
    return { status: "error", message: errors[0] };
  }

  const { ok, newBalance } = await repositories.coin.decrementIfSufficient(
    userId,
    COIN_COSTS.createTest
  );
  if (!ok) {
    return { status: "error", message: "insufficient_coins" };
  }

  try {
    const test = await repositories.test.create({ ...testInput, createdBy: userId, approved: false });
    return { status: "success", data: { test, remainingCoins: newBalance } };
  } catch (error) {
    await repositories.coin.increment(userId, COIN_COSTS.createTest);
    throw error;
  }
}
