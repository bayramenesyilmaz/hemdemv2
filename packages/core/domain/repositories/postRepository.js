/**
 * @typedef {object} PostRepository
 * @property {(post: Partial<import("../entities/post.js").Post>) => Promise<import("../entities/post.js").Post>} create
 * @property {(limit: number, before?: string) => Promise<import("../entities/post.js").Post[]>} findFeed
 * @property {(id: number, userId: string) => Promise<void>} deleteOwn
 */

export {};
