/**
 * Seed verisini okunabilir tutan yardımcılar. Sadece mock katmanında
 * kullanılır — gerçek Supabase yolunda karşılığı yoktur.
 */

/**
 * Harici bir görsel servisine bağımlı kalmamak için avatarları baş
 * harflerden üretilen bir SVG data-URI olarak oluşturur. `next/image`
 * bunları `unoptimized` ile render eder (bkz. avatarUrl.startsWith("data:")).
 *
 * @param {string} initials
 * @param {string} from - gradyan başlangıç rengi
 * @param {string} to - gradyan bitiş rengi
 */
export function avatar(initials, from, to) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect width="128" height="128" fill="url(#g)"/>` +
    `<text x="64" y="64" font-family="system-ui,sans-serif" font-size="50" font-weight="700" ` +
    `fill="#ffffff" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Cevap dizisini kısa bir desenden üretir: "abca" -> q1:o1, q2:o2,
 * q3:o3, q4:o1. Seed'de onlarca cevabı tek satırda ifade edebilmek için.
 *
 * @param {string} pattern
 */
export function answers(pattern) {
  return pattern.split("").map((letter, index) => ({
    questionId: `q${index + 1}`,
    choiceId: `o${letter.charCodeAt(0) - 96}`,
  }));
}

/**
 * `n` gün önceyi ISO string olarak döndürür — seed'deki içeriklerin
 * hepsinin aynı saniyede oluşmuş görünmesini engeller.
 *
 * @param {number} days
 */
export function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * @param {string} id
 * @param {string} text
 * @param {string[]} options
 */
export function question(id, text, options) {
  return {
    id,
    text,
    options: options.map((optionText, index) => ({ id: `o${index + 1}`, text: optionText })),
  };
}
