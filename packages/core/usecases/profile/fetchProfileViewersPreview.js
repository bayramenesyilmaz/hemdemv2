export const PROFILE_VIEWERS_PREVIEW_LIMIT = 3;

/**
 * Profili kimlerin görüntülediğini coin ödemeden önce ücretsiz bir
 * önizleme olarak gösterir: en son 3 görüntüleyen her zaman görünür,
 * gerisi `unlockProfileViewers` ile coin karşılığı açılır.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function fetchProfileViewersPreview(repositories, userId) {
  const views = await repositories.profileView.findViewers(userId);
  const preview = views.slice(0, PROFILE_VIEWERS_PREVIEW_LIMIT);
  const profiles = await Promise.all(preview.map((view) => repositories.user.findById(view.viewerId)));
  const viewers = preview
    .map((view, index) => ({ viewedAt: view.createdAt, viewer: profiles[index] }))
    .filter((entry) => entry.viewer);

  return { status: "success", data: { viewers, totalCount: views.length } };
}
