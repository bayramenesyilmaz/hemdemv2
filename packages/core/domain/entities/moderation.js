/**
 * Test oluşturmada +18/küfür/aşağılama içerik filtresi. Elle derlenmiş
 * küçük bir Türkçe + İngilizce kelime listesi — MVP kapsamında makul bir
 * ilk savunma hattı, ileri düzey bir moderasyon API'si (ör. üçüncü taraf
 * bir servis) değil, %100 kaçırma/yanlış pozitif olmayacağını garanti
 * etmez. Ayrı dosya (test.js'e gömülü değil) çünkü ileride gönderi/not/
 * bio gibi başka kullanıcı metni alanlarına da uygulanabilir — bu turda
 * sadece test oluşturmaya bağlanıyor.
 *
 * Kısa/belirsiz kökler (ör. "top", "mal", "meme" gibi Türkçe'de son derece
 * yaygın ve zararsız da olan kelimeler) bilinçli olarak listeye alınmadı —
 * aşırı yanlış pozitif üretirdi. Kelime sınırı (`\b`) eşleşmesi kullanılır,
 * bu yüzden "aşık" gibi normalize edilince "asik" olan zararsız kelimeler
 * "sik" ile yanlışlıkla eşleşmez (aralarında kelime sınırı yok).
 */
const BLOCKED_WORDS = [
  // Türkçe
  "amk",
  "aq",
  "amına koyayım",
  "amcık",
  "yarrak",
  "yarrağı",
  "siktir",
  "sikeyim",
  "sikik",
  "orospu",
  "piç",
  "götveren",
  "ibne",
  "pezevenk",
  "kahpe",
  "şerefsiz",
  "puşt",
  "gavat",
  "kaltak",
  "sürtük",
  "gerizekalı",
  // İngilizce
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "cunt",
  "whore",
  "slut",
  "nigger",
  "faggot",
  "retard",
];

function normalize(text) {
  return text
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const BLOCKED_PATTERN = new RegExp(
  `\\b(${BLOCKED_WORDS.map((word) => escapeRegExp(normalize(word))).join("|")})\\b`
);

/**
 * @param {string} text
 * @returns {boolean}
 */
export function containsProfanity(text) {
  if (!text) return false;
  return BLOCKED_PATTERN.test(normalize(text));
}
