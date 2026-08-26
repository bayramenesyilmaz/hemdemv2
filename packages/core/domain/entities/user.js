/**
 * @typedef {"male" | "female"} Gender
 * @typedef {"male" | "female" | "both"} InterestedIn
 * @typedef {"user" | "admin"} UserRole
 *
 * @typedef {object} Profile
 * @property {string} id                       - auth.users.id ile aynı (1:1)
 * @property {string} createdAt
 * @property {string|null} name
 * @property {string|null} avatarUrl
 * @property {string|null} bio
 * @property {Gender|null} gender
 * @property {string|null} country
 * @property {InterestedIn|null} interestedIn
 * @property {string|null} birthdate            - ISO date (YYYY-MM-DD)
 * @property {string} language                  - "tr" | "en"
 * @property {UserRole} role
 * @property {boolean} isBanned
 * @property {string|null} gateTestId
 * @property {number|null} gateTestThreshold     - 0-100
 * @property {boolean} allowGuestLikes
 * @property {Record<string, string>} socialLinks - { instagram: "https://..." } gibi
 */

const ALLOWED_GENDERS = ["male", "female"];
const ALLOWED_INTERESTS = ["male", "female", "both"];
const ALLOWED_LANGUAGES = ["tr", "en"];
const ALLOWED_ROLES = ["user", "admin"];
const MAX_SOCIAL_LINKS = 10;

/**
 * @param {Partial<Profile>} input
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateProfile(input) {
  const errors = [];

  if (input.gender != null && !ALLOWED_GENDERS.includes(input.gender)) {
    errors.push("invalid_gender");
  }
  if (
    input.interestedIn != null &&
    !ALLOWED_INTERESTS.includes(input.interestedIn)
  ) {
    errors.push("invalid_interested_in");
  }
  if (input.language != null && !ALLOWED_LANGUAGES.includes(input.language)) {
    errors.push("invalid_language");
  }
  if (input.role != null && !ALLOWED_ROLES.includes(input.role)) {
    errors.push("invalid_role");
  }
  if (
    input.gateTestThreshold != null &&
    (input.gateTestThreshold < 0 || input.gateTestThreshold > 100)
  ) {
    errors.push("invalid_gate_test_threshold");
  }
  if (input.bio != null && input.bio.length > 1000) {
    errors.push("bio_too_long");
  }
  if (input.socialLinks != null) {
    const entries = Object.entries(input.socialLinks);
    const isValidShape =
      typeof input.socialLinks === "object" &&
      !Array.isArray(input.socialLinks) &&
      entries.every(([platform, url]) => typeof platform === "string" && typeof url === "string");
    if (!isValidShape || entries.length > MAX_SOCIAL_LINKS) {
      errors.push("invalid_social_links");
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * İlk-giriş profil tamamlama akışının hangi kullanıcılara gösterileceğini
 * belirler: kayıt sırasında sadece isim alınır, geri kalan zorunlu alanlar
 * (cinsiyet, doğum tarihi, ilgi tercihi) onboarding'de tamamlanır.
 *
 * @param {Partial<Profile>|null} profile
 * @returns {boolean}
 */
export function isProfileComplete(profile) {
  if (!profile) return false;
  return Boolean(profile.name && profile.gender && profile.birthdate && profile.interestedIn);
}

/**
 * @param {string} birthdate - ISO date string
 * @returns {number}
 */
export function calculateAge(birthdate) {
  if (!birthdate) return 0;
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return age;
}
