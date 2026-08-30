import { validateMessageContent } from "../../domain/entities/chat.js";
import { COIN_COSTS } from "../../domain/entities/coin.js";
import { hasPerfectTestMatch } from "../tests/hasPerfectTestMatch.js";
import { safeCreateNotification } from "../notifications/safeCreateNotification.js";

/**
 * Mesaj gönderir. Sohbet açılma sırası:
 * 1. Zaten bir sohbet varsa oraya yazılır.
 * 2. Karşılıklı beğeni (eşleşme) varsa sohbet ücretsiz açılır.
 * 3. Ortak çözülmüş bir testte tam uyum (%100) varsa sohbet yine
 *    ücretsiz açılır — uygulamanın temel vaadi bu.
 * 4. Hiçbiri yoksa coin karşılığı "süper mesaj" ile açılır.
 *
 * @param {object} repositories
 * @param {string} senderId
 * @param {string} recipientId
 * @param {string} content
 */
export async function sendMessage(repositories, senderId, recipientId, content) {
  if (senderId === recipientId) {
    return { status: "error", message: "cannot_message_self" };
  }

  const { valid, errors } = validateMessageContent(content);
  if (!valid) {
    return { status: "error", message: errors[0] };
  }

  const recipient = await repositories.user.findById(recipientId);
  if (!recipient) {
    return { status: "error", message: "recipient_not_found" };
  }

  let chat = await repositories.chat.findByPair(senderId, recipientId);

  if (!chat) {
    const match = await repositories.match.findByPair(senderId, recipientId);
    const perfectTestMatch = match
      ? false
      : await hasPerfectTestMatch(repositories, senderId, recipientId);

    if (match || perfectTestMatch) {
      chat = await repositories.chat.create({ userA: senderId, userB: recipientId, source: "match" });
    } else {
      const { ok } = await repositories.coin.decrementIfSufficient(senderId, COIN_COSTS.superMessage);
      if (!ok) {
        return { status: "error", message: "insufficient_coins" };
      }
      chat = await repositories.chat.create({
        userA: senderId,
        userB: recipientId,
        source: "super_message",
      });
    }
  }

  const message = await repositories.chat.createMessage(chat.id, { senderId, content });
  await repositories.chat.touchLastMessageAt(chat.id, message.createdAt);
  // Mesaj zaten kaydedildi; bildirim başarısız olsa bile mesajın
  // gönderilmesi engellenmesin (bkz. safeCreateNotification).
  await safeCreateNotification(repositories, { userId: recipientId, type: "message", actorId: senderId });

  return { status: "success", data: { chat, message } };
}
