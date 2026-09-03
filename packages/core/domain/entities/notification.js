/**
 * @typedef {"test_similarity" | "incoming_like" | "match" | "message" | "daily_match"} NotificationType
 *
 * @typedef {object} Notification
 * @property {number} id
 * @property {string} createdAt
 * @property {string} userId - bildirimi alan
 * @property {NotificationType} type
 * @property {string|null} actorId - bildirimi tetikleyen kullanıcı (daily_match için eşleşen kullanıcı)
 * @property {string|null} testId
 * @property {number|null} similarity - test_similarity için 0-100
 * @property {boolean} isRead
 */

export const NOTIFICATION_TYPES = ["test_similarity", "incoming_like", "match", "message", "daily_match"];

/**
 * @param {Partial<Notification>} input
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateNotification(input) {
  const errors = [];
  if (!input.userId) errors.push("user_id_required");
  if (!NOTIFICATION_TYPES.includes(input.type)) errors.push("invalid_type");
  return { valid: errors.length === 0, errors };
}
