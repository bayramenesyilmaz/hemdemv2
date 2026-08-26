/**
 * @typedef {object} MatchRepository
 * @property {(userA: string, userB: string) => Promise<import("../entities/match.js").Match|null>} findByPair
 * @property {(userA: string, userB: string) => Promise<import("../entities/match.js").Match>} create
 * @property {(userId: string) => Promise<import("../entities/match.js").Match[]>} findByUser
 */

export {};
