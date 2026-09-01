/**
 * Web'in mock modundaki davranışla aynı: gerçek bir Storage yerine
 * çağıranın hazırladığı `data:` URI'yi (web'de FileReader, mobilde
 * expo-image-picker'ın base64 çıktısı) doğrudan `avatarUrl` olarak
 * kullanır — bkz. `apps/web/.../ProfileEditForm.js`'deki aynı yaklaşım.
 *
 * @returns {import("../../domain/repositories/storageRepository.js").StorageRepository}
 */
export function createMockStorageRepository() {
  return {
    async uploadAvatar(userId, file) {
      return file;
    },
  };
}
