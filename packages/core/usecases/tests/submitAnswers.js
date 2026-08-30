import {
  calculateAnswerSimilarity,
  SIMILARITY_NOTIFY_THRESHOLD,
} from "../../domain/entities/test.js";
import { safeCreateNotification } from "../notifications/safeCreateNotification.js";

/**
 * Bir teste cevap gönderir. Testler bir bilgi sınavı değildir: doğru
 * cevap yoktur, gönderilen cevaplar aynı testi çözmüş diğer kullanıcılarla
 * karşılaştırılarak uyum yüzdesi üretir.
 *
 * Cevap kaydedildikten sonra, eşiği aşan benzerlikteki her kullanıcıya
 * **ve** çözen kişiye karşılıklı bildirim düşer — kullanıcı testi çözüp
 * beklerken "senin gibi cevaplayan biri çıktı" bildirimini bu üretir.
 *
 * Testin `point` değeri varsa katılım puanı olarak eklenir (doğruluk
 * değil, aktiflik göstergesi — liderlik tablosu bunu kullanır).
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {string} testId
 * @param {{ questionId: string, choiceId: string }[]} userAnswers
 */
export async function submitAnswers(repositories, userId, testId, userAnswers) {
  const test = await repositories.test.findById(testId);
  if (!test) {
    return { status: "error", message: "test_not_found" };
  }

  const existing = await repositories.test.findAnswer(userId, testId);
  if (existing) {
    return { status: "error", message: "already_answered" };
  }

  const answer = await repositories.test.saveAnswer({ userId, testId, userAnswers });

  if (test.point > 0) {
    await repositories.point.increment(userId, test.point);
  }

  const others = (await repositories.test.findAnswersByTest(testId)).filter(
    (other) => other.userId !== userId
  );

  let newHighMatches = 0;
  for (const other of others) {
    const similarity = calculateAnswerSimilarity(userAnswers, other.userAnswers);
    if (similarity < SIMILARITY_NOTIFY_THRESHOLD) continue;

    newHighMatches += 1;
    // Karşılıklı: iki taraf da birbirini görebilmeli. Bildirim oluşturma
    // burada kasıtlı olarak hataya dayanıklı (bkz. safeCreateNotification) —
    // aksi halde bildirim tablosuyla ilgili bir sorun, çözülmüş cevabın
    // hiç kaydedilmemiş gibi görünmesine (istemci sonsuza kadar
    // "gönderiliyor" durumunda takılı kalır) yol açabiliyordu.
    await safeCreateNotification(repositories, {
      userId: other.userId,
      type: "test_similarity",
      actorId: userId,
      testId,
      similarity,
    });
    await safeCreateNotification(repositories, {
      userId,
      type: "test_similarity",
      actorId: other.userId,
      testId,
      similarity,
    });
  }

  return { status: "success", data: { answer, newHighMatches } };
}
