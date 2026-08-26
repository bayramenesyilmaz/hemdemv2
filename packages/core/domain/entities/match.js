/**
 * @typedef {object} Match
 * @property {number} id
 * @property {string} createdAt
 * @property {string} userA
 * @property {string} userB
 */

import { orderUserPair } from "./swipe.js";

/**
 * @param {string} userIdA
 * @param {string} userIdB
 * @returns {{ userA: string, userB: string }}
 */
export function buildMatchPair(userIdA, userIdB) {
  const [userA, userB] = orderUserPair(userIdA, userIdB);
  return { userA, userB };
}
