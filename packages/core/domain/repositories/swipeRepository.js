/**
 * @typedef {object} SwipeRepository
 * @property {(fromUser: string, toUser: string) => Promise<import("../entities/swipe.js").Swipe|null>} findByPair
 * @property {(swipe: Partial<import("../entities/swipe.js").Swipe>) => Promise<import("../entities/swipe.js").Swipe>} create
 * @property {(toUser: string) => Promise<import("../entities/swipe.js").Swipe[]>} findIncomingLikes
 * @property {(fromUser: string, toUser: string) => Promise<void>} delete
 */

export {};
