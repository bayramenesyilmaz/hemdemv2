/**
 * @typedef {object} ProfileView
 * @property {number} id
 * @property {string} createdAt
 * @property {string} viewerId
 * @property {string} viewedId
 *
 * @typedef {object} ProfileViewRepository
 * @property {(viewerId: string, viewedId: string) => Promise<void>} recordView
 * @property {(viewedId: string) => Promise<number>} countViews
 * @property {(viewedId: string) => Promise<ProfileView[]>} findViewers
 */

export {};
