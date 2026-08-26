/**
 * @typedef {"like" | "dislike" | "superlike"} SwipeAction
 *
 * @typedef {object} Swipe
 * @property {number} id
 * @property {string} createdAt
 * @property {string} fromUser
 * @property {string} toUser
 * @property {SwipeAction} action
 */

const ALLOWED_ACTIONS = ["like", "dislike", "superlike"];

/**
 * @param {Partial<Swipe>} input
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSwipe(input) {
  const errors = [];

  if (!input.fromUser) errors.push("from_user_required");
  if (!input.toUser) errors.push("to_user_required");
  if (input.fromUser && input.toUser && input.fromUser === input.toUser) {
    errors.push("cannot_swipe_self");
  }
  if (!ALLOWED_ACTIONS.includes(input.action)) {
    errors.push("invalid_action");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * matches tablosu (user_a < user_b) kısıtına uyacak şekilde
 * iki kullanıcı kimliğini sıralı döndürür.
 *
 * @param {string} userIdA
 * @param {string} userIdB
 * @returns {[string, string]}
 */
export function orderUserPair(userIdA, userIdB) {
  return userIdA < userIdB ? [userIdA, userIdB] : [userIdB, userIdA];
}
