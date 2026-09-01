import { Share } from "react-native";
import { WEB_BASE_URL } from "./config";

/**
 * `Share.share`'in `url` alanı sadece iOS'ta çalışır (Android görmezden
 * gelir) — bu yüzden link, iki platformda da işe yarasın diye her zaman
 * `message` metninin içine gömülür. `WEB_BASE_URL` ayarlanmamışsa
 * (bkz. lib/config.js) sadece metin paylaşılır, kırık bir link değil.
 *
 * @param {{ text: string, path?: string }} input
 */
export async function shareLink({ text, path }) {
  const url = WEB_BASE_URL && path ? `${WEB_BASE_URL}${path}` : null;
  const message = url ? `${text}\n${url}` : text;
  try {
    await Share.share({ message, ...(url ? { url } : {}) });
  } catch {
    // Kullanıcı paylaşım sayfasını iptal etti — sessizce geç.
  }
}
