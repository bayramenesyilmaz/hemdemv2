/**
 * @typedef {"complaint" | "request"} RequestType
 *
 * @typedef {object} SupportRequest
 * @property {string} id
 * @property {string} createdAt
 * @property {string|null} userId
 * @property {RequestType} type
 * @property {string} subject
 * @property {string} description
 * @property {string|null} email
 */

const REQUEST_TYPES = ["complaint", "request"];

/**
 * @param {Partial<SupportRequest>} input
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateRequest(input) {
  const errors = [];
  if (!REQUEST_TYPES.includes(input.type)) errors.push("invalid_type");
  if (!input.subject || input.subject.trim().length === 0) errors.push("subject_required");
  if (!input.description || input.description.trim().length === 0) errors.push("description_required");
  if (!input.userId && !input.email) errors.push("email_required");
  return { valid: errors.length === 0, errors };
}
