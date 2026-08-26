/**
 * @typedef {object} Post
 * @property {number} id
 * @property {string} createdAt
 * @property {string} userId
 * @property {string} content
 * @property {string|null} taggedTestId
 */

const MAX_POST_LENGTH = 500;

/**
 * @param {Partial<Post>} input
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePost(input) {
  const errors = [];
  if (!input.content || input.content.trim().length === 0) {
    errors.push("content_required");
  }
  if (input.content && input.content.length > MAX_POST_LENGTH) {
    errors.push("content_too_long");
  }
  return { valid: errors.length === 0, errors };
}
