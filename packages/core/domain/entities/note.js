/**
 * @typedef {object} Note
 * @property {string} id
 * @property {string} createdAt
 * @property {string} userId
 * @property {string} text
 */

const MAX_NOTE_LENGTH = 1000;

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
