"use server";

import { createTest } from "@hemdem/core/usecases/tests/createTest";
import { submitAnswers } from "@hemdem/core/usecases/tests/submitAnswers";
import { deleteOwnTest } from "@hemdem/core/usecases/tests/deleteOwnTest";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

/**
 * @param {object} input
 */
export async function createTestAction(input) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return createTest(repositories, userId, input);
}

/**
 * @param {string} testId
 * @param {{ questionId: string, choiceId: string }[]} userAnswers
 */
export async function submitAnswersAction(testId, userAnswers) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return submitAnswers(repositories, userId, testId, userAnswers);
}

/**
 * @param {string} testId
 */
export async function deleteOwnTestAction(testId) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return deleteOwnTest(repositories, userId, testId);
}

const TEST_PICKER_LIMIT = 20;

/**
 * Kapı testi / gönderi etiketleme seçicileri, test sayısı büyüdükçe
 * bütün testleri tarayıcıya göndermek yerine bu arama ucunu kullanır.
 *
 * @param {string} query
 */
export async function searchTestsAction(query) {
  const tests = await repositories.test.findMany({
    search: query || undefined,
    limit: TEST_PICKER_LIMIT,
  });
  return { status: "success", data: tests };
}
