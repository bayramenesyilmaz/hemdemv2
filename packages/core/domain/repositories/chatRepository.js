/**
 * @typedef {object} ChatRepository
 * @property {(userA: string, userB: string) => Promise<import("../entities/chat.js").Chat|null>} findByPair
 * @property {(chat: Partial<import("../entities/chat.js").Chat>) => Promise<import("../entities/chat.js").Chat>} create
 * @property {(userId: string) => Promise<import("../entities/chat.js").Chat[]>} findByUser
 * @property {(chatId: number) => Promise<import("../entities/chat.js").Chat|null>} findById
 * @property {(chatId: number, timestamp: string) => Promise<void>} touchLastMessageAt
 * @property {(chatId: number, message: Partial<import("../entities/chat.js").Message>) => Promise<import("../entities/chat.js").Message>} createMessage
 * @property {(chatId: number, limit: number, before?: string) => Promise<import("../entities/chat.js").Message[]>} findMessages
 * @property {(cutoffIso: string) => Promise<number>} deleteInactiveChats
 * @property {(chatId: number, userId: string) => Promise<void>} markRead
 * @property {(chatId: number) => Promise<{ userId: string, lastReadAt: string }[]>} getReadStates
 */

export {};
