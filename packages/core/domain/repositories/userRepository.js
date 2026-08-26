/**
 * UserRepository sözleşmesi. Bu dosya implementasyon içermez —
 * infrastructure/supabase/supabaseUserRepository.js gerçek implementasyondur.
 *
 * @typedef {object} UserRepository
 * @property {(id: string) => Promise<import("../entities/user.js").Profile|null>} findById
 * @property {(id: string, patch: Partial<import("../entities/user.js").Profile>) => Promise<import("../entities/user.js").Profile>} update
 * @property {(profile: Partial<import("../entities/user.js").Profile> & { id: string }) => Promise<import("../entities/user.js").Profile>} create
 * @property {(id: string) => Promise<void>} delete
 * @property {(filters: object, excludeUserId: string) => Promise<import("../entities/user.js").Profile[]>} findDiscoverCandidates
 */

export {};
