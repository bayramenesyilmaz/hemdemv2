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
        photos: [],
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
        lastSeenAt: null,
        boostedUntil: null,
        verificationPhotoUrl: null,
        verificationStatus: "none",
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

    async findMany(filters = {}) {
      let profiles = [...store.profiles.values()];
      if (filters.search) {
        const needle = filters.search.toLowerCase();
        profiles = profiles.filter(
          (p) => p.name?.toLowerCase().includes(needle) || p.id.toLowerCase().includes(needle)
        );
      }
      if (filters.verificationStatus) {
        profiles = profiles.filter((p) => p.verificationStatus === filters.verificationStatus);
      }
      return profiles.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },

    async touchLastSeen(id) {
      const existing = store.profiles.get(id);
      if (!existing) return;
      existing.lastSeenAt = new Date().toISOString();
    },
  };
}
