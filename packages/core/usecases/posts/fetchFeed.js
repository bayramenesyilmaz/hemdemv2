/**
 * Gönderi akışını, yazar profili ve (varsa) etiketlenen testin başlığıyla
 * zenginleştirilmiş şekilde döndürür. Misafirler de çağırabilir.
 *
 * @param {object} repositories
 * @param {{ limit?: number, before?: string }} [options]
 */
export async function fetchFeed(repositories, options = {}) {
  const posts = await repositories.post.findFeed(options.limit ?? 20, options.before);

  const enriched = await Promise.all(
    posts.map(async (post) => {
      const [author, taggedTest] = await Promise.all([
        repositories.user.findById(post.userId),
        post.taggedTestId ? repositories.test.findById(post.taggedTestId) : null,
      ]);
      return { post, author, taggedTest };
    })
  );

  return { status: "success", data: enriched.filter((entry) => entry.author) };
}
