/**
 * @param {object} repositories
 * @param {string} blockerId
 * @param {string} blockedId
 */
export async function unblockUser(repositories, blockerId, blockedId) {
  await repositories.block.delete(blockerId, blockedId);
  return { status: "success" };
}
