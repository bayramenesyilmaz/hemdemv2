"use server";

import { setUserBanStatus } from "@hemdem/core/usecases/admin/setUserBanStatus";
import { approveTest } from "@hemdem/core/usecases/admin/approveTest";
import { rejectTest } from "@hemdem/core/usecases/admin/rejectTest";
import { approveVerification } from "@hemdem/core/usecases/admin/approveVerification";
import { rejectVerification } from "@hemdem/core/usecases/admin/rejectVerification";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

/**
 * @param {string} targetUserId
 * @param {boolean} isBanned
 */
export async function setUserBanStatusAction(targetUserId, isBanned) {
  const callerId = await getAuthUserId();
  if (!callerId) {
    return { status: "error", message: "not_authenticated" };
  }
  return setUserBanStatus(repositories, callerId, targetUserId, isBanned);
}

/**
 * @param {string} testId
 */
export async function approveTestAction(testId) {
  const callerId = await getAuthUserId();
  if (!callerId) {
    return { status: "error", message: "not_authenticated" };
  }
  return approveTest(repositories, callerId, testId);
}

/**
 * @param {string} testId
 */
export async function rejectTestAction(testId) {
  const callerId = await getAuthUserId();
  if (!callerId) {
    return { status: "error", message: "not_authenticated" };
  }
  return rejectTest(repositories, callerId, testId);
}

/**
 * @param {string} targetUserId
 */
export async function approveVerificationAction(targetUserId) {
  const callerId = await getAuthUserId();
  if (!callerId) {
    return { status: "error", message: "not_authenticated" };
  }
  return approveVerification(repositories, callerId, targetUserId);
}

/**
 * @param {string} targetUserId
 */
export async function rejectVerificationAction(targetUserId) {
  const callerId = await getAuthUserId();
  if (!callerId) {
    return { status: "error", message: "not_authenticated" };
  }
  return rejectVerification(repositories, callerId, targetUserId);
}
