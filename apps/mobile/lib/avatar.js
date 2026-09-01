// Mock seed'deki `data:image/svg+xml` avatarları RN Image'ın render
// edemediği tek format — gerçek yüklenen bir fotoğraf her zaman
// jpeg/png/webp/gif olacağı için bu kontrol yeterli (bkz. InitialsAvatar.js).
export function isRenderableImageUri(uri) {
  return Boolean(uri) && !uri.startsWith("data:image/svg+xml");
}
