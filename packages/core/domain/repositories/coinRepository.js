/**
 * @typedef {object} CoinRepository
 * @property {(userId: string) => Promise<number>} getBalance
 * @property {(userId: string, amount: number) => Promise<number>} increment
 * @property {(userId: string, amount: number) => Promise<{ ok: boolean, newBalance: number }>} decrementIfSufficient
 */

export {};
