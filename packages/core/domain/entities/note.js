/**
 * @typedef {object} Note
 * @property {string} id
 * @property {string} createdAt
 * @property {string} userId
 * @property {string} text
 */

const MAX_NOTE_LENGTH = 1000;

/** Instagram Not'a benzer şekilde notlar 24 saat sonra görünmez olur. */
export const NOTE_LIFETIME_MS = 24 * 60 * 60 * 1000;

/**
 * @param {string} text
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateNoteText(text) {
  const errors = [];
  if (!text || text.trim().length === 0) errors.push("text_required");
  if (text && text.length > MAX_NOTE_LENGTH) errors.push("text_too_long");
  return { valid: errors.length === 0, errors };
}

/**
 * @param {string} createdAt
 * @returns {boolean}
 */
export function isNoteExpired(createdAt) {
  return Date.now() - new Date(createdAt).getTime() > NOTE_LIFETIME_MS;
}
