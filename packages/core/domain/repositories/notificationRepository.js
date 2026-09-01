/**
 * `type`/`excludeType`, mesaj bildirimlerinin genel "bildirimler"
 * rozetinden/listesinden ayrı tutulabilmesi için — mesaj bildirimleri
 * kendi (Mesajlar sekmesindeki) rozetiyle sayılır/okunur, genel bildirim
 * sayaç ve "hepsini okundu yap" akışı bunları hiç görmez.
 *
 * @typedef {{ type?: string, excludeType?: string }} NotificationTypeFilter
 *
 * @typedef {object} NotificationRepository
 * @property {(notification: Partial<import("../entities/notification.js").Notification>) => Promise<import("../entities/notification.js").Notification>} create
 * @property {(userId: string, limit?: number) => Promise<import("../entities/notification.js").Notification[]>} findByUser
 * @property {(userId: string, filter?: NotificationTypeFilter) => Promise<number>} countUnread
 * @property {(userId: string) => Promise<{ general: number, message: number }>} countUnreadSummary - genel + mesaj sayaçlarını TEK sorguda döndürür (bkz. usecases/notifications/fetchUnreadSummary.js — sürekli polling'in DB isteği sayısını yarıya indirmek için)
 * @property {(userId: string, filter?: NotificationTypeFilter) => Promise<void>} markAllRead
 */

export {};
