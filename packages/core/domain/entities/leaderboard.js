/**
 * Periyodik liderlik ödülleri: her periyot türü kendi penceresini
 * (ms cinsinden) ve periyot anahtarını (aynı pencerede tekrar ödül
 * verilmesin diye idempotency anahtarı) tanımlar.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export const LEADERBOARD_PERIODS = {
  daily: {
    windowMs: DAY_MS,
    rewards: [100, 60, 30],
    /** @param {Date} now */
    periodKey: (now) => now.toISOString().slice(0, 10), // YYYY-MM-DD
  },
  threeDay: {
    windowMs: 3 * DAY_MS,
    rewards: [200, 120, 60],
    periodKey: (now) => String(Math.floor(now.getTime() / (3 * DAY_MS))),
  },
  weekly: {
    windowMs: 7 * DAY_MS,
    rewards: [400, 250, 120],
    periodKey: (now) => String(Math.floor(now.getTime() / (7 * DAY_MS))),
  },
};
