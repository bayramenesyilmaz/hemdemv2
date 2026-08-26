/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/userRepository.js").UserRepository}
 */
export function createMockUserRepository(store) {
  return {
    async findById(id) {
      return store.profiles.get(id) ?? null;
    },

    async create(profile) {
      const full = {
        createdAt: new Date().toISOString(),
        name: null,
        avatarUrl: null,
        bio: null,
        gender: null,
        country: null,
        interestedIn: null,
        birthdate: null,
        language: "tr",
        role: "user",
        isBanned: false,
        gateTestId: null,
        gateTestThreshold: null,
        allowGuestLikes: false,
        socialLinks: {},
        ...profile,
      };
      store.profiles.set(profile.id, full);
      return full;
    },

    async update(id, patch) {
      const existing = store.profiles.get(id);
      if (!existing) throw new Error("mock_profile_not_found");
      const updated = { ...existing, ...patch };
      store.profiles.set(id, updated);
      return updated;
    },

    async delete(id) {
      store.profiles.delete(id);
    },

    async findDiscoverCandidates(filters, excludeUserId) {
      const excludeIds = new Set(filters?.excludeIds ?? []);
      let candidates = [...store.profiles.values()].filter(
        (p) => p.id !== excludeUserId && !p.isBanned && !excludeIds.has(p.id)
      );
      if (filters?.gender) candidates = candidates.filter((p) => p.gender === filters.gender);
      if (filters?.country) candidates = candidates.filter((p) => p.country === filters.country);
      if (filters?.minBirthdate) {
        candidates = candidates.filter((p) => p.birthdate && p.birthdate >= filters.minBirthdate);
      }
      if (filters?.maxBirthdate) {
        candidates = candidates.filter((p) => p.birthdate && p.birthdate <= filters.maxBirthdate);
      }
      return candidates.slice(0, filters?.limit ?? 50);
    },
  };
}
