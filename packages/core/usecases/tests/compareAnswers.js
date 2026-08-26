import { calculateAnswerSimilarity } from "../../domain/entities/test.js";

/**
 * İki kullanıcının aynı testteki cevaplarını soru soru yan yana koyar:
 * her soruda kimin hangi şıkkı seçtiği, isimleriyle birlikte görünür.
 *
 * Sadece her iki tarafın da testi çözmüş olması durumunda çalışır —
 * başkasının cevaplarını, kendisi çözmeden görmek mümkün değildir.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {string} testId
 * @param {string} otherUserId
 */
export async function compareAnswers(repositories, userId, testId, otherUserId) {
  if (userId === otherUserId) {
    return { status: "error", message: "cannot_compare_self" };
  }

  const test = await repositories.test.findById(testId);
  if (!test) {
    return { status: "error", message: "test_not_found" };
  }

  const ownAnswer = await repositories.test.findAnswer(userId, testId);
  if (!ownAnswer) {
    return { status: "error", message: "not_answered_yet" };
  }

  const otherAnswer = await repositories.test.findAnswer(otherUserId, testId);
  if (!otherAnswer) {
    return { status: "error", message: "other_not_answered" };
  }

  const [ownProfile, otherProfile] = await Promise.all([
    repositories.user.findById(userId),
    repositories.user.findById(otherUserId),
  ]);
  if (!otherProfile || otherProfile.isBanned) {
    return { status: "error", message: "user_not_found" };
  }

  const ownChoices = new Map(ownAnswer.userAnswers.map((a) => [a.questionId, a.choiceId]));
  const otherChoices = new Map(otherAnswer.userAnswers.map((a) => [a.questionId, a.choiceId]));

  const rows = test.questions.map((question) => {
    const ownChoiceId = ownChoices.get(question.id) ?? null;
    const otherChoiceId = otherChoices.get(question.id) ?? null;
    const optionText = (choiceId) =>
      question.options.find((option) => option.id === choiceId)?.text ?? null;

    return {
      questionId: question.id,
      questionText: question.text,
      ownChoice: optionText(ownChoiceId),
      otherChoice: optionText(otherChoiceId),
      isMatch: Boolean(ownChoiceId) && ownChoiceId === otherChoiceId,
    };
  });

  return {
    status: "success",
    data: {
      test,
      ownProfile,
      otherProfile,
      rows,
      similarity: calculateAnswerSimilarity(ownAnswer.userAnswers, otherAnswer.userAnswers),
    },
  };
}
