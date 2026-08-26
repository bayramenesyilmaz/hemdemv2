/**
 * @typedef {object} TestRepository
 * @property {(id: string) => Promise<import("../entities/test.js").Test|null>} findById
 * @property {(filters: { categoryId?: number, language?: string, search?: string }) => Promise<import("../entities/test.js").Test[]>} findMany
 * @property {(test: Partial<import("../entities/test.js").Test>) => Promise<import("../entities/test.js").Test>} create
 * @property {(id: string, patch: Partial<import("../entities/test.js").Test>) => Promise<import("../entities/test.js").Test>} update
 * @property {(id: string) => Promise<void>} softDelete
 * @property {(userId: string) => Promise<import("../entities/test.js").Test[]>} findCreatedByUser
 * @property {(userId: string, testId: string) => Promise<import("../entities/test.js").Answer|null>} findAnswer
 * @property {(answer: Partial<import("../entities/test.js").Answer>) => Promise<import("../entities/test.js").Answer>} saveAnswer
 * @property {(userId: string) => Promise<import("../entities/test.js").Answer[]>} findAnswersByUser
 * @property {(testId: string) => Promise<import("../entities/test.js").Answer[]>} findAnswersByTest
 * @property {(limit: number) => Promise<{ userId: string, point: number }[]>} findLeaderboard
 * @property {() => Promise<import("../entities/test.js").Test[]>} findPendingApproval
 */

export {};
