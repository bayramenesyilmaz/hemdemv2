import { validateSwipe } from "../../domain/entities/swipe.js";
import { calculateAnswerSimilarity } from "../../domain/entities/test.js";
import { safeCreateNotification } from "../notifications/safeCreateNotification.js";

/**
 * Beğeni/geçme gönderir. Hedef kullanıcının bir "kapı testi" (gate test)
 * seçili ise, gönderenin o testi daha önce çözmüş olması ve benzerlik
 * yüzdesinin eşiği geçmesi şarttır. Karşılıklı beğenide otomatik eşleşme
 * ve sohbet açılır.
 *
 * @param {object} repositories
 * @param {string} fromUserId
 * @param {string} toUserId
 * @param {"like" | "dislike" | "superlike"} [action]
 */
export async function likeUser(repositories, fromUserId, toUserId, action = "like") {
  const { valid, errors } = validateSwipe({ fromUser: fromUserId, toUser: toUserId, action });
  if (!valid) {
    return { status: "error", message: errors[0] };
  }

  const targetProfile = await repositories.user.findById(toUserId);
  if (!targetProfile) {
    return { status: "error", message: "target_not_found" };
  }

  if (action !== "dislike" && targetProfile.gateTestId) {
    const senderAnswer = await repositories.test.findAnswer(fromUserId, targetProfile.gateTestId);
    if (!senderAnswer) {
      return { status: "error", message: "gate_test_not_completed" };
    }

    const targetAnswer = await repositories.test.findAnswer(toUserId, targetProfile.gateTestId);
    const similarity = calculateAnswerSimilarity(
      senderAnswer.userAnswers,
      targetAnswer?.userAnswers ?? []
    );

    const threshold = targetProfile.gateTestThreshold ?? 0;
    if (similarity < threshold) {
      return { status: "error", message: "gate_test_threshold_not_met" };
    }
  }

  await repositories.swipe.create({ fromUser: fromUserId, toUser: toUserId, action });

  if (action === "dislike") {
    return { status: "success", data: { matched: false } };
  }

  const reciprocal = await repositories.swipe.findByPair(toUserId, fromUserId);
  const reciprocalLiked = reciprocal && ["like", "superlike"].includes(reciprocal.action);

  if (!reciprocalLiked) {
    // Henüz eşleşme yok: hedef kullanıcı beğenildiğini anında öğrensin.
    // Bildirim başarısız olsa bile beğeni zaten kaydedildi, bu yüzden
    // (bkz. safeCreateNotification) hataya dayanıklı çağrılıyor.
    await safeCreateNotification(repositories, { userId: toUserId, type: "incoming_like", actorId: fromUserId });
    return { status: "success", data: { matched: false } };
  }

  const match = await repositories.match.create(fromUserId, toUserId);

  let chat = await repositories.chat.findByPair(fromUserId, toUserId);
  if (!chat) {
    chat = await repositories.chat.create({ userA: fromUserId, userB: toUserId, source: "match" });
  }

  await Promise.all([
    safeCreateNotification(repositories, { userId: fromUserId, type: "match", actorId: toUserId }),
    safeCreateNotification(repositories, { userId: toUserId, type: "match", actorId: fromUserId }),
  ]);

  return { status: "success", data: { matched: true, match, chat } };
}
