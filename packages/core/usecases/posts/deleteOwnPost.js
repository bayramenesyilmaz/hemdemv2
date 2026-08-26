/**
 * Bir gönderiyi sadece onu paylaşan kullanıcı silebilir — bu kontrol
 * bilerek repository katmanında değil, burada (usecase) yapılır.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {number} postId
 */
export async function deleteOwnPost(repositories, userId, postId) {
  const post = await repositories.post.findById(postId);
  if (!post) {
    return { status: "error", message: "post_not_found" };
  }
  if (post.userId !== userId) {
    return { status: "error", message: "not_owner" };
  }

  await repositories.post.deleteOwn(postId, userId);
  return { status: "success" };
}
