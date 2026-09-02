import { ageRangeToBirthdateRange, sortByBoost } from "../../domain/entities/user.js";

/**
 * Misafir modu: hesabı olmayan bir ziyaretçi için keşfet kartlarını
 * getirir. Kişiselleştirme (interestedIn'e göre otomatik cinsiyet
 * filtresi) yoktur çünkü henüz bir profil yoktur — sadece açıkça
 * seçilen filtreler uygulanır.
 *
 * @param {object} repositories
 * @param {{ gender?: string, country?: string, minAge?: number, maxAge?: number, limit?: number }} [filters]
 */
export async function fetchGuestDiscoverCandidates(repositories, filters = {}) {
  const { minBirthdate, maxBirthdate } = ageRangeToBirthdateRange(filters.minAge, filters.maxAge);

  const candidates = await repositories.user.findDiscoverCandidates({
    gender: filters.gender,
    country: filters.country,
    minBirthdate,
    maxBirthdate,
    limit: filters.limit,
  });

  return { status: "success", data: sortByBoost(candidates) };
}
