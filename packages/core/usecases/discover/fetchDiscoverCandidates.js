import { ageRangeToBirthdateRange } from "../../domain/entities/user.js";

/**
 * @param {object} repositories
 * @param {string} userId
 * @param {{ gender?: string, country?: string, minAge?: number, maxAge?: number, limit?: number }} [filters]
 */
export async function fetchDiscoverCandidates(repositories, userId, filters = {}) {
  const viewer = await repositories.user.findById(userId);
  if (!viewer) {
    return { status: "error", message: "profile_not_found" };
  }

  const gender =
    filters.gender ?? (viewer.interestedIn && viewer.interestedIn !== "both" ? viewer.interestedIn : undefined);

  const { minBirthdate, maxBirthdate } = ageRangeToBirthdateRange(filters.minAge, filters.maxAge);

  const alreadySwiped = await repositories.swipe.findByFromUser(userId);
  const excludeIds = alreadySwiped.map((s) => s.toUser);

  const candidates = await repositories.user.findDiscoverCandidates(
    { gender, country: filters.country, minBirthdate, maxBirthdate, excludeIds, limit: filters.limit },
    userId
  );

  return { status: "success", data: candidates };
}
