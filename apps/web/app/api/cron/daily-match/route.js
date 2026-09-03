import { NextResponse } from "next/server";
import { computeDailyMatch } from "@hemdem/core/usecases/discover/computeDailyMatch";
import { repositories } from "@/lib/repositories";

/**
 * Vercel Cron (bkz. apps/web/vercel.json) bu uçu günde bir kez, TR
 * sabahı çağırır — `leaderboard-rewards/route.js` ile birebir aynı
 * `CRON_SECRET` bearer-auth iskeleti. Aynı gün için tekrar tetiklenirse
 * `computeDailyMatch` içindeki idempotency kontrolü (matchedDate zaten
 * bugünse no-op) ikinci kez eşleşme/bildirim üretilmesini engeller.
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
  const users = (await repositories.user.findMany()).filter((user) => !user.isBanned);

  let computed = 0;
  let failed = 0;
  for (const user of users) {
    try {
      await computeDailyMatch(repositories, user.id, now);
      computed += 1;
    } catch (error) {
      failed += 1;
      console.error("[daily-match] hesaplanamadı:", user.id, error);
    }
  }

  return NextResponse.json({ ok: true, results: { total: users.length, computed, failed } });
}
