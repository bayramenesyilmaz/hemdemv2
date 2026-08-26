import { validateProfile } from "../../domain/entities/user.js";

/**
 * İlk-giriş profil tamamlama: `name` kayıt sırasında zaten alınmıştır
 * (bkz. registerUser), burada sadece geri kalan zorunlu alanlar
 * tamamlanır. `name` yine de gönderilirse günceller (profil düzenleme
 * ekranından da çağrılabilmesi için).
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {{ name?: string, gender: string, birthdate: string, interestedIn: string, country?: string }} input
 */
export async function completeOnboarding(repositories, userId, input) {
  const { valid, errors } = validateProfile(input);
  if (!valid) {
    return { status: "error", message: errors[0] };
  }

  const existing = await repositories.user.findById(userId);
  if (!existing) {
    return { status: "error", message: "profile_not_found" };
  }

  const name = input.name ?? existing.name;
  if (!name || !input.gender || !input.birthdate || !input.interestedIn) {
    return { status: "error", message: "missing_required_fields" };
  }

  const profile = await repositories.user.update(userId, {
    name,
    gender: input.gender,
    birthdate: input.birthdate,
    interestedIn: input.interestedIn,
    country: input.country ?? existing.country,
  });

  return { status: "success", data: profile };
}
