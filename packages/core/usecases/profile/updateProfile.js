import { validateProfile } from "../../domain/entities/user.js";

const EDITABLE_FIELDS = [
  "name",
  "avatarUrl",
  "photos",
  "bio",
  "gender",
  "country",
  "interestedIn",
  "birthdate",
  "language",
  "gateTestId",
  "gateTestThreshold",
  "allowGuestLikes",
  "socialLinks",
];

/**
 * Profil düzenleme ekranından çağrılır. Sadece izin verilen alanları
 * günceller — `role`, `isBanned` gibi yönetimsel alanlar burada asla
 * değiştirilemez (admin panelinin kendi usecase'leri olacak).
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {object} input
 */
export async function updateProfile(repositories, userId, input) {
  const { valid, errors } = validateProfile(input);
  if (!valid) {
    return { status: "error", message: errors[0] };
  }

  const existing = await repositories.user.findById(userId);
  if (!existing) {
    return { status: "error", message: "profile_not_found" };
  }

  if (input.gateTestId) {
    const gateTest = await repositories.test.findById(input.gateTestId);
    if (!gateTest) {
      return { status: "error", message: "gate_test_not_found" };
    }
  }

  const patch = {};
  for (const field of EDITABLE_FIELDS) {
    if (input[field] !== undefined) patch[field] = input[field];
  }

  const profile = await repositories.user.update(userId, patch);
  return { status: "success", data: profile };
}
