import { validatePost } from "../../domain/entities/post.js";
import { findProfanityMatches } from "../../domain/entities/moderation.js";

/**
 * @param {object} repositories
 * @param {string} userId
 * @param {{ content: string, taggedTestId?: string }} input
 */
export async function createPost(repositories, userId, input) {
  const { valid, errors } = validatePost({ content: input.content });
  if (!valid) {
    const data = errors[0] === "inappropriate_content" ? { flaggedWords: findProfanityMatches(input.content) } : undefined;
    return { status: "error", message: errors[0], data };
  }

  const post = await repositories.post.create({
    userId,
    content: input.content,
    taggedTestId: input.taggedTestId ?? null,
  });

  return { status: "success", data: post };
}
