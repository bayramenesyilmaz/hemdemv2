/**
 * @typedef {object} Note
 * @property {string} id
 * @property {string} createdAt
 * @property {string} userId
 * @property {string} text
 *
 * @typedef {object} NoteRepository
 * @property {(userId: string) => Promise<Note[]>} findByUser
 * @property {(userIds: string[]) => Promise<Record<string, Note>>} findLatestByUsers
 * @property {(note: Partial<Note>) => Promise<Note>} create
 * @property {(id: string, userId: string, text: string) => Promise<Note>} update
 * @property {(id: string, userId: string) => Promise<void>} delete
 */

export {};
