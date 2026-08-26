/**
 * @typedef {object} NotificationRepository
 * @property {(notification: Partial<import("../entities/notification.js").Notification>) => Promise<import("../entities/notification.js").Notification>} create
 * @property {(userId: string, limit?: number) => Promise<import("../entities/notification.js").Notification[]>} findByUser
 * @property {(userId: string) => Promise<number>} countUnread
 * @property {(userId: string) => Promise<void>} markAllRead
 */

export {};
