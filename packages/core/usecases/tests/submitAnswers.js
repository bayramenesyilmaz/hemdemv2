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
    // Katılım puanı ikincil bir yan etkidir; cevap zaten kaydedildi.
    // Puan tablosunda bir sorun olursa (bkz. safeCreateNotification'daki
    // aynı gerekçe) tüm işlemi patlatıp kullanıcıyı "gönderiliyor"
    // durumunda takılı bırakmasın.
    try {
      await repositories.point.increment(userId, test.point);
    } catch (error) {
      console.error("[tests] katılım puanı eklenemedi, cevap yine de kaydedildi:", error);
    }
  }

  // Benzerlik hesaplama + bildirim adımlarının tamamı ikincil bir yan
  // etkidir; cevap zaten kaydedildi. Burada beklenmedik bir hata (ör.
  // findAnswersByTest'in kendisi patlarsa) tüm işlemi geçersiz kılıp
  // kullanıcıyı "gönderiliyor" durumunda takılı bırakmasın diye tek bir
  // try/catch ile sarmalanıyor.
  let newHighMatches = 0;
  try {
    const others = (await repositories.test.findAnswersByTest(testId)).filter(
      (other) => other.userId !== userId
    );

    for (const other of others) {
      const similarity = calculateAnswerSimilarity(userAnswers, other.userAnswers);
      if (similarity < SIMILARITY_NOTIFY_THRESHOLD) continue;

      newHighMatches += 1;
      // Karşılıklı: iki taraf da birbirini görebilmeli.
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
  } catch (error) {
    console.error("[tests] benzerlik/bildirim adımı başarısız, cevap yine de kaydedildi:", error);
  }

  return { status: "success", data: { answer, newHighMatches } };
}
