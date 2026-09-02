/**
 * @typedef {"male" | "female"} Gender
 * @typedef {"male" | "female" | "both"} InterestedIn
 * @typedef {"user" | "admin"} UserRole
 *
 * @typedef {object} Profile
 * @property {string} id                       - auth.users.id ile aynı (1:1)
 * @property {string} createdAt
 * @property {string|null} name
 * @property {string|null} avatarUrl        - photos[0] ile senkron tutulur, geriye dönük uyumluluk için
 * @property {string[]} photos              - profil fotoğraf galerisi, en fazla 3
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
 * @property {string|null} lastSeenAt              - son aktiflik zamanı, çevrimiçi durumu buradan türetilir
 * @property {string|null} boostedUntil            - dolana kadar keşfette öne çıkar
 * @property {string|null} verificationPhotoUrl
 * @property {"none"|"pending"|"approved"|"rejected"} verificationStatus
 */

const ALLOWED_GENDERS = ["male", "female"];
const ALLOWED_INTERESTS = ["male", "female", "both"];
const ALLOWED_LANGUAGES = ["tr", "en"];
const ALLOWED_ROLES = ["user", "admin"];
const ALLOWED_VERIFICATION_STATUSES = ["none", "pending", "approved", "rejected"];
const MAX_SOCIAL_LINKS = 10;
const MAX_PHOTOS = 3;

/** Bu eşiğin altında son görülme varsa kullanıcı "çevrimiçi" sayılır. */
export const ONLINE_THRESHOLD_MINUTES = 3;

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
  if (input.photos != null) {
    const isValidShape = Array.isArray(input.photos) && input.photos.every((url) => typeof url === "string");
    if (!isValidShape || input.photos.length > MAX_PHOTOS) {
      errors.push("invalid_photos");
    }
  }
  if (input.verificationStatus != null && !ALLOWED_VERIFICATION_STATUSES.includes(input.verificationStatus)) {
    errors.push("invalid_verification_status");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * @param {string|null} lastSeenAt
 * @returns {boolean}
 */
export function isOnline(lastSeenAt) {
  if (!lastSeenAt) return false;
  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  return diffMs < ONLINE_THRESHOLD_MINUTES * 60 * 1000;
}

/**
 * Boost'u aktif olan profiller (`boostedUntil` gelecekte) listenin önüne
 * alınır, göreli sıra korunur. Repository sorgusuna `order by
 * boosted_until` eklemek yerine burada yapılır — süresi geçmiş ama hâlâ
 * dolu bir `boostedUntil` değerini DB seviyesinde "aktif değil" olarak
 * sıralamak `now()` karşılaştırması gerektirir, JS'teki tek satırlık
 * filtreden daha kırılgan olurdu.
 *
 * @param {Partial<Profile>[]} profiles
 * @returns {Partial<Profile>[]}
 */
export function sortByBoost(profiles) {
  const now = Date.now();
  const isActive = (profile) => profile.boostedUntil && new Date(profile.boostedUntil).getTime() > now;
  return [...profiles.filter(isActive), ...profiles.filter((profile) => !isActive(profile))];
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

/**
 * Keşfet filtresindeki yaş aralığını (ör. 25-35) veritabanında
 * sorgulanabilir bir doğum tarihi aralığına çevirir. `minAge` en genç,
 * `maxAge` en yaşlı kişiyi belirler; bu yüzden `minAge` en YAKIN
 * (büyük) doğum tarihine, `maxAge` en ESKİ (küçük) doğum tarihine
 * karşılık gelir.
 *
 * @param {number} [minAge]
 * @param {number} [maxAge]
 * @returns {{ minBirthdate?: string, maxBirthdate?: string }}
 */
export function ageRangeToBirthdateRange(minAge, maxAge) {
  const today = new Date();
  const range = {};

  if (minAge != null) {
    const maxBirthdate = new Date(today);
    maxBirthdate.setFullYear(today.getFullYear() - minAge);
    range.maxBirthdate = maxBirthdate.toISOString().slice(0, 10);
  }

  if (maxAge != null) {
    const minBirthdate = new Date(today);
    minBirthdate.setFullYear(today.getFullYear() - maxAge - 1);
    minBirthdate.setDate(minBirthdate.getDate() + 1);
    range.minBirthdate = minBirthdate.toISOString().slice(0, 10);
  }

  return range;
}
