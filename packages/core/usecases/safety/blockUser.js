/**
 * Bir kullanıcıyı engeller — karşılıklı görünmezlik `findRelatedIds` ile
 * sağlanır (bkz. `blockRepository.js`): engelleyen de engellenen de
 * keşfet/mesaj/beğeni listelerinde birbirini göremez olur.
 *
 * @param {object} repositories
 * @param {string} blockerId
 * @param {string} blockedId
 */
export async function blockUser(repositories, blockerId, blockedId) {
  if (blockerId === blockedId) {
    return { status: "error", message: "cannot_block_self" };
  }

  const target = await repositories.user.findById(blockedId);
  if (!target) {
    return { status: "error", message: "user_not_found" };
  }

  const block = await repositories.block.create(blockerId, blockedId);
  return { status: "success", data: block };
}
