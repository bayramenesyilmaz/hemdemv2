/**
 * @typedef {object} UserCoin
 * @property {string} userId
 * @property {number} coin
 *
 * @typedef {object} UserPoint
 * @property {string} userId
 * @property {number} point
 */

/**
 * Reklam izleme kademeleri: her kademe daha uzun izleme süresi
 * karşılığında daha avantajlı coin/saniye oranı sunar.
 * En yüksek kademe en avantajlı olarak öne çıkarılır (bkz. plan md 5.11).
 *
 * @type {{ tier: number, seconds: number, coinReward: number }[]}
 */
export const AD_WATCH_TIERS = [
  { tier: 1, seconds: 15, coinReward: 10 },
  { tier: 2, seconds: 30, coinReward: 25 },
  { tier: 3, seconds: 45, coinReward: 40 },
  { tier: 4, seconds: 60, coinReward: 60 },
  { tier: 5, seconds: 90, coinReward: 100 },
  { tier: 6, seconds: 120, coinReward: 150 },
];

export const COIN_COSTS = {
  createTest: 300,
  superMessage: 50,
  unlockProfileViewers: 100,
};

/**
 * @param {number} tier
 * @returns {{ tier: number, seconds: number, coinReward: number } | undefined}
 */
export function getAdWatchTier(tier) {
  return AD_WATCH_TIERS.find((t) => t.tier === tier);
}
