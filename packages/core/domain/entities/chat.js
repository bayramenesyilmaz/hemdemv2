/**
 * @typedef {"match" | "super_message"} ChatSource
 *
 * @typedef {object} Chat
 * @property {number} id
 * @property {string} createdAt
 * @property {string} lastMessageAt
 * @property {string} userA
 * @property {string} userB
 * @property {ChatSource} source
 *
 * @typedef {object} Message
 * @property {number} id
 * @property {string} createdAt
 * @property {number} chatId
 * @property {string} senderId
 * @property {string} content
 */

import { orderUserPair } from "./swipe.js";

const MAX_MESSAGE_LENGTH = 2000;

/**
 * @param {string} userIdA
 * @param {string} userIdB
 * @param {ChatSource} source
 * @returns {{ userA: string, userB: string, source: ChatSource }}
 */
export function buildChatPair(userIdA, userIdB, source) {
  const [userA, userB] = orderUserPair(userIdA, userIdB);
  return { userA, userB, source };
}

/**
 * @param {string} content
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateMessageContent(content) {
  const errors = [];
  if (!content || content.trim().length === 0) errors.push("content_required");
  if (content && content.length > MAX_MESSAGE_LENGTH) errors.push("content_too_long");
  return { valid: errors.length === 0, errors };
}
