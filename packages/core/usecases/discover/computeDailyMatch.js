import { calculateAnswerSimilarity } from "../../domain/entities/test.js";
import { fetchDiscoverCandidates } from "./fetchDiscoverCandidates.js";
import { safeCreateNotification } from "../notifications/safeCreateNotification.js";

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Kullanıcının o günkü "Günün Eşleşmesi"ni hesaplar: keşfet adayları
 * arasında, kullanıcıyla ortak çözülmüş en az bir testi olan ve o ortak
 * testlerin en yükseğinde `calculateAnswerSimilarity` skoru en iyi çıkan
 * aday seçilir. Ortak testi olan aday yoksa (ya da kullanıcı hiç test
 * çözmemişse) adaylardan rastgele biri seçilir — özellik hiçbir zaman boş
 * dönmesin diye.
 *
 * Aynı gün için tekrar çağrılırsa (cron yeniden çalışırsa) `daily_matches`
 * satırındaki `matchedDate` zaten bugünse yeniden hesaplama/bildirim
 * YAPILMAZ — `leaderboardReward.hasGranted` ile aynı idempotency deseni.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {Date} [date]
 */
export async function computeDailyMatch(repositories, userId, date = new Date()) {
  const dateKey = toDateKey(date);

  const existing = await repositories.dailyMatch.findByUser(userId);
  if (existing?.matchedDate === dateKey) {
    return { status: "success", data: { ...existing, alreadyComputed: true } };
  }

  const candidatesResult = await fetchDiscoverCandidates(repositories, userId, { limit: 200 });
  if (candidatesResult.status === "error") {
    return candidatesResult;
  }
  const candidates = candidatesResult.data;
  if (candidates.length === 0) {
    const saved = await repositories.dailyMatch.upsert({ userId, matchedUserId: null, matchedDate: dateKey });
    return { status: "success", data: saved };
  }

  const ownAnswers = await repositories.test.findAnswersByUser(userId);
  const ownAnswersByTest = new Map(ownAnswers.map((a) => [a.testId, a.userAnswers]));

  let bestCandidateId = null;
  let bestScore = -1;

  if (ownAnswersByTest.size > 0) {
    for (const candidate of candidates) {
      const candidateAnswers = await repositories.test.findAnswersByUser(candidate.id);
      let candidateBestScore = -1;
      for (const answer of candidateAnswers) {
        const ownAnswer = ownAnswersByTest.get(answer.testId);
        if (!ownAnswer) continue;
        const similarity = calculateAnswerSimilarity(ownAnswer, answer.userAnswers);
        if (similarity > candidateBestScore) candidateBestScore = similarity;
      }
      if (candidateBestScore > bestScore) {
        bestScore = candidateBestScore;
        bestCandidateId = candidate.id;
      }
    }
  }

  const matchedUserId = bestCandidateId ?? candidates[Math.floor(Math.random() * candidates.length)].id;
  const saved = await repositories.dailyMatch.upsert({ userId, matchedUserId, matchedDate: dateKey });

  await safeCreateNotification(repositories, {
    userId,
    type: "daily_match",
    actorId: matchedUserId,
  });

  return { status: "success", data: saved };
}
