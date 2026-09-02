/**
 * DailyMatchRepository sözleşmesi. Kullanıcı başına tek satır (user_coins
 * ile aynı desen) — her gün cron ile üzerine yazılır.
 *
 * @typedef {object} DailyMatch
 * @property {string} userId
 * @property {string|null} matchedUserId
 * @property {string} matchedDate  - ISO date (YYYY-MM-DD)
 * @property {string} createdAt
 *
 * @typedef {object} DailyMatchRepository
 * @property {(userId: string) => Promise<DailyMatch|null>} findByUser
 * @property {(match: { userId: string, matchedUserId: string|null, matchedDate: string }) => Promise<DailyMatch>} upsert
 */

export {};
