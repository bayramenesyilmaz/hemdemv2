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
  }
  if (!Array.isArray(input.questions) || input.questions.length === 0) {
    errors.push("questions_required");
  } else {
    for (const question of input.questions) {
      if (!question.text || !Array.isArray(question.options) || question.options.length < 2) {
        errors.push("invalid_question");
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
