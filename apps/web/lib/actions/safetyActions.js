"use server";

import { blockUser } from "@hemdem/core/usecases/safety/blockUser";
import { unblockUser } from "@hemdem/core/usecases/safety/unblockUser";
import { reportUser } from "@hemdem/core/usecases/safety/reportUser";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

/**
 * @param {string} targetUserId
 */
export async function blockUserAction(targetUserId) {
  const userId = await getAuthUserId();
  if (!userId) return { status: "error", message: "not_authenticated" };
  return blockUser(repositories, userId, targetUserId);
}

/**
 * @param {string} targetUserId
 */
export async function unblockUserAction(targetUserId) {
  const userId = await getAuthUserId();
  if (!userId) return { status: "error", message: "not_authenticated" };
  return unblockUser(repositories, userId, targetUserId);
}

/**
 * @param {string} targetUserId
 * @param {{ subject: string, description: string }} input
 */
export async function reportUserAction(targetUserId, input) {
  const userId = await getAuthUserId();
  if (!userId) return { status: "error", message: "not_authenticated" };
  return reportUser(repositories, {
    reporterId: userId,
    targetUserId,
    subject: input.subject,
    description: input.description,
  });
}
