import { validateMessageContent } from "../../domain/entities/chat.js";
import { COIN_COSTS } from "../../domain/entities/coin.js";

/**
 * Mesaj gönderir. Eşleşme yoksa ve eşleşmemiş sohbet de yoksa, coin
 * karşılığı "süper mesaj" ile yeni bir sohbet açılır.
 *
 * @param {object} repositories
 * @param {string} senderId
 * @param {string} recipientId
 * @param {string} content
 */
export async function sendMessage(repositories, senderId, recipientId, content) {
  const { valid, errors } = validateMessageContent(content);
  if (!valid) {
    return { status: "error", message: errors[0] };
  }

  let chat = await repositories.chat.findByPair(senderId, recipientId);

  if (!chat) {
    const match = await repositories.match.findByPair(senderId, recipientId);

    if (match) {
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

  return { status: "success", data: { chat, message } };
}
