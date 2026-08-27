/**
 * @typedef {object} WindowedLeaderboardEntry
 * @property {string} userId
 * @property {number} point
 *
 * @typedef {object} PointRepository
 * @property {(userId: string) => Promise<number>} getBalance
 * @property {(userId: string, amount: number) => Promise<number>} increment
 * @property {(windowMs: number, limit: number) => Promise<WindowedLeaderboardEntry[]>} findWindowedLeaderboard
 */

export {};
