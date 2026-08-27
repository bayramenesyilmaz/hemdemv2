"use server";

import { createPost } from "@hemdem/core/usecases/posts/createPost";
import { createPostWithTest } from "@hemdem/core/usecases/posts/createPostWithTest";
import { deleteOwnPost } from "@hemdem/core/usecases/posts/deleteOwnPost";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

/**
 * @param {{ content: string, taggedTestId?: string }} input
 */
export async function createPostAction(input) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return createPost(repositories, userId, input);
}

/**
 * @param {number} postId
 */
export async function deleteOwnPostAction(postId) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return deleteOwnPost(repositories, userId, postId);
}

/**
 * Gönderiyi paylaşırken o an oluşturulan yeni testi de kaydeder.
 *
 * @param {{ content: string, test: object }} input
 */
export async function createPostWithTestAction(input) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return createPostWithTest(repositories, userId, input);
}
