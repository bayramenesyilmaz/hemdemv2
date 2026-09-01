/**
 * @typedef {object} Block
 * @property {string} id
 * @property {string} createdAt
 * @property {string} blockerId
 * @property {string} blockedId
 *
 * @typedef {object} BlockRepository
 * @property {(blockerId: string, blockedId: string) => Promise<Block>} create
 * @property {(blockerId: string, blockedId: string) => Promise<void>} delete
 * @property {(blockerId: string, blockedId: string) => Promise<boolean>} exists
 * @property {(userId: string) => Promise<string[]>} findBlockedIds - userId'nin engellediği kullanıcı id'leri
 * @property {(userId: string) => Promise<string[]>} findRelatedIds - userId'yi ilgilendiren tüm engelleme id'leri (iki yönlü — karşılıklı görünmezlik için: hem userId'nin engellediği hem de userId'yi engelleyen kullanıcılar)
 */

export {};
