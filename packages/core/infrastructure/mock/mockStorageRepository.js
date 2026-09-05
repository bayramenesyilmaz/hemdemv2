/**
 * Web'in mock modundaki asıl davranışı: çağıranın hazırladığı `data:`
 * URI'yi (web'de FileReader, mobilde expo-image-picker'ın base64
 * çıktısı) doğrudan `avatarUrl` olarak kullanır — bkz.
 * `apps/web/.../ProfileEditForm.js`'deki aynı yaklaşım.
 *
 * Ama arayüz sözleşmesi (`storageRepository.js`) her zaman bir `string`
 * URL döneceğini garanti ediyor — bir server action'a `<input
 * type="file">`'dan gelen gerçek bir `File`/`Blob` geçilirse (ör.
 * `submitVerificationPhoto`, mock modda client tarafında özel bir
 * FileReader dalı olmadan çağrılıyor) burada string olmayan bir değer
 * sızıp `avatarUrl.startsWith(...)` gibi tüketicilerde patlıyordu — bkz.
 * gerçek hata: "profile.verificationPhotoUrl.startsWith is not a
 * function". Bu yüzden string olmayan bir `file` her zaman burada
 * `data:` URI'ye çevrilir, sözleşme her çağıran için korunur.
 *
 * @returns {import("../../domain/repositories/storageRepository.js").StorageRepository}
 */
export function createMockStorageRepository() {
  return {
    async uploadAvatar(userId, file) {
      if (typeof file === "string") return file;
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || "image/jpeg";
      return `data:${mimeType};base64,${buffer.toString("base64")}`;
    },
  };
}
