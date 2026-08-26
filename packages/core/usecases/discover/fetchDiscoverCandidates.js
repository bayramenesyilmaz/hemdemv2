/**
 * @param {object} repositories
 * @param {string} userId
 * @param {{ gender?: string, country?: string, limit?: number }} [filters]
 */
export async function fetchDiscoverCandidates(repositories, userId, filters = {}) {
  const viewer = await repositories.user.findById(userId);
  if (!viewer) {
    return { status: "error", message: "profile_not_found" };
  }

  const gender =
    filters.gender ?? (viewer.interestedIn && viewer.interestedIn !== "both" ? viewer.interestedIn : undefined);

  const candidates = await repositories.user.findDiscoverCandidates(
    { gender, country: filters.country, limit: filters.limit },
    userId
  );

  return { status: "success", data: candidates };
}
