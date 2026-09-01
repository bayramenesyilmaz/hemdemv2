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
 * @property {string|null} targetUserId - hedefli "kullanıcıyı şikayet et" akışında dolu, genel destek talebinde null
 *
 * @typedef {object} RequestRepository
 * @property {(request: Partial<SupportRequest>) => Promise<SupportRequest>} create
 * @property {(filters?: { type?: RequestType }) => Promise<SupportRequest[]>} findMany
 */

export {};
