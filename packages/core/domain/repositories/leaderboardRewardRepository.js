/**
 * @typedef {object} LeaderboardRewardRepository
 * @property {(periodType: string, periodKey: string) => Promise<boolean>} hasGranted
 * @property {(periodType: string, periodKey: string, userId: string, rank: number, coins: number) => Promise<void>} recordGrant
 */

export {};
