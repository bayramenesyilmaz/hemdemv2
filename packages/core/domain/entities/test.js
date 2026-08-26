/**
 * @typedef {object} TestOption
 * @property {string} id
 * @property {string} text
 *
 * @typedef {object} TestQuestion
 * @property {string} id
 * @property {string} text
 * @property {TestOption[]} options
 *
 * @typedef {object} Test
 * @property {string} id
 * @property {string} createdAt
 * @property {string|null} createdBy
 * @property {string} title
 * @property {number} categoryId
 * @property {string} language
 * @property {TestQuestion[]} questions
 * @property {number} point
 * @property {boolean} approved
 * @property {boolean} isDeleted
 *
 * @typedef {object} AnswerChoice
 * @property {string} questionId
 * @property {string} choiceId
 *
 * @typedef {object} Answer
 * @property {string} id
 * @property {string} createdAt
 * @property {string} userId
 * @property {string} testId
 * @property {AnswerChoice[]} userAnswers
 */

/**
 * Sabit kategori listesi — `key` alanı apps/web'de çeviri anahtarı olarak
 * kullanılır (ör. `testCategories.love`), etiketin kendisi burada
 * tutulmaz çünkü domain katmanı dil bilmez.
 */
export const TEST_CATEGORIES = [
  { id: 1, key: "love" },
  { id: 2, key: "personality" },
  { id: 3, key: "fun" },
  { id: 4, key: "career" },
];

const VALID_CATEGORY_IDS = TEST_CATEGORIES.map((c) => c.id);

/**
 * Testler bir bilgi sınavı değil, uyum ölçme aracıdır: doğru cevap
 * yoktur, amaç aynı diziyi izleyen / aynı kitabı okuyan / aynı şekilde
 * düşünen insanları eşleştirmektir. Bu yüzden testler kısa tutulur —
 * uzun test doldurulmaz, doldurulmayan test eşleşme üretmez.
 */
export const TEST_LIMITS = {
  maxQuestions: 10,
  minOptions: 2,
  maxOptions: 4,
};

/**
 * Bu eşiğin üstünde cevap veren kullanıcılara karşılıklı bildirim
 * gönderilir ("senin gibi cevaplayan biri çıktı").
 */
export const SIMILARITY_NOTIFY_THRESHOLD = 70;

/**
 * Tam uyum: eşleşme beklemeden doğrudan mesaj gönderme hakkı verir
 * (bkz. usecases/chat/sendMessage).
 */
export const SIMILARITY_DIRECT_MESSAGE = 100;

/**
 * @param {Partial<Test>} input
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTest(input) {
  const errors = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push("title_required");
  }
  if (input.categoryId == null) {
    errors.push("category_required");
  } else if (!VALID_CATEGORY_IDS.includes(input.categoryId)) {
    errors.push("invalid_category");
  }

  if (!Array.isArray(input.questions) || input.questions.length === 0) {
    errors.push("questions_required");
  } else if (input.questions.length > TEST_LIMITS.maxQuestions) {
    errors.push("too_many_questions");
  } else {
    for (const question of input.questions) {
      const options = question.options;
      if (!question.text || !question.text.trim()) {
        errors.push("invalid_question");
        break;
      }
      if (!Array.isArray(options) || options.length < TEST_LIMITS.minOptions) {
        errors.push("invalid_question");
        break;
      }
      if (options.length > TEST_LIMITS.maxOptions) {
        errors.push("too_many_options");
        break;
      }
      if (options.some((option) => !option?.text || !option.text.trim())) {
        errors.push("invalid_option");
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * İki cevap kümesi arasındaki benzerlik yüzdesini hesaplar.
 * Sadece her iki tarafın da cevapladığı sorular karşılaştırılır.
 *
 * @param {AnswerChoice[]} answersA
 * @param {AnswerChoice[]} answersB
 * @returns {number} 0-100 arası yüzde
 */
export function calculateAnswerSimilarity(answersA, answersB) {
  if (!answersA?.length || !answersB?.length) return 0;

  const mapB = new Map(answersB.map((a) => [a.questionId, a.choiceId]));
  let compared = 0;
  let matched = 0;

  for (const a of answersA) {
    if (!mapB.has(a.questionId)) continue;
    compared += 1;
    if (mapB.get(a.questionId) === a.choiceId) matched += 1;
  }

  if (compared === 0) return 0;
  return Math.round((matched / compared) * 100);
}
