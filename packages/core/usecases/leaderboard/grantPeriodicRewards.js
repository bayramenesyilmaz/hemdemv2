import { LEADERBOARD_PERIODS } from "../../domain/entities/leaderboard.js";

/**
 * Bir periyot türü (daily/threeDay/weekly) için o pencerede en çok puan
 * toplayan ilk 3 kullanıcıya coin ödülü verir. Aynı periyot anahtarına
 * (ör. aynı gün, aynı hafta) birden fazla kez çağrılırsa — cron her gün
 * çalışıp "threeDay"/"weekly" periyotlarının sınırını geçtiğini kontrol
 * ettiği için bu kaçınılmaz — `leaderboardReward.hasGranted` sayesinde
 * ikinci kez ödül verilmez.
 *
 * @param {object} repositories
 * @param {keyof typeof LEADERBOARD_PERIODS} periodType
 * @param {Date} [now]
 */
export async function grantPeriodicRewards(repositories, periodType, now = new Date()) {
  const period = LEADERBOARD_PERIODS[periodType];
  if (!period) {
    return { status: "error", message: "invalid_period" };
  }

  const periodKey = period.periodKey(now);
  const alreadyGranted = await repositories.leaderboardReward.hasGranted(periodType, periodKey);
  if (alreadyGranted) {
    return { status: "success", data: { granted: false, reason: "already_granted", periodKey } };
  }

  const top = await repositories.point.findWindowedLeaderboard(period.windowMs, period.rewards.length);
  const winners = [];

  for (let rank = 0; rank < top.length; rank++) {
    const { userId } = top[rank];
    const coins = period.rewards[rank];
    await repositories.coin.increment(userId, coins);
    await repositories.leaderboardReward.recordGrant(periodType, periodKey, userId, rank + 1, coins);
    winners.push({ userId, rank: rank + 1, coins });
  }

  return { status: "success", data: { granted: true, periodKey, winners } };
}
