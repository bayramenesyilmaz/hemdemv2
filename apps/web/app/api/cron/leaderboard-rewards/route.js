import { NextResponse } from "next/server";
import { grantPeriodicRewards } from "@hemdem/core/usecases/leaderboard/grantPeriodicRewards";
import { repositories } from "@/lib/repositories";

/**
 * Vercel Cron (bkz. repo kökündeki vercel.json) bu uçu günde bir kez
 * çağırır. Üç periyodun hepsi burada değerlendirilir; "daily" her
 * çağrıda periyot anahtarı (bugünün tarihi) değiştiği için tetiklenir,
 * "threeDay"/"weekly" ise kendi periyot anahtarları ancak sınırı
 * geçince değiştiğinden ara günlerde no-op'tur (idempotency
 * `leaderboardReward.hasGranted` ile sağlanır — bkz. usecase).
 *
 * Vercel, cron isteklerine otomatik olarak `Authorization: Bearer
 * $CRON_SECRET` ekler; bu header eşleşmezse istek reddedilir ki uç
 * dışarıdan keyfi çağrılıp tekrar tekrar ödül denemesi yapamasın
 * (idempotency zaten bunu engeller ama savunma derinliği için).
 */
export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const results = {};
  for (const periodType of ["daily", "threeDay", "weekly"]) {
    results[periodType] = await grantPeriodicRewards(repositories, periodType, now);
  }

  return NextResponse.json({ ok: true, results });
}
