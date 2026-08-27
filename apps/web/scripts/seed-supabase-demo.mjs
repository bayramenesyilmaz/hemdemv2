#!/usr/bin/env node
/**
 * Gerçek Supabase projesine, mock modda görülen aynı demo veriyi
 * (13 profil, 8 uyum testi, cevaplar, gönderiler, sohbetler, bildirimler…)
 * yazar. `getMockStore()` tek doğruluk kaynağıdır — burada veri tekrar
 * yazılmaz, sadece mock anahtarları ("demo-user-1") gerçek Supabase Auth
 * UUID'lerine çevrilip tablolara aktarılır (bkz. scripts/lib/buildDemoRows.mjs).
 *
 * Kullanım (apps/web içinden):
 *   node scripts/seed-supabase-demo.mjs           # var olanı yeniden kullan
 *   node scripts/seed-supabase-demo.mjs --reset   # önce tüm demo hesapları sil, baştan oluştur
 *
 * Gereken ortam değişkenleri (.env.local'den otomatik okunur, yoksa
 * process.env'den beklenir): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 *
 * Neden auth.users üzerinden gidiyoruz: `profiles.id`, `auth.users(id)`'e
 * foreign key'dir (bkz. migrations/0001_init.sql). Yani önce gerçek bir
 * Supabase Auth kullanıcısı olmadan tek bir sahte profil bile eklenemez.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createSupabaseServerClient } from "@hemdem/core/infrastructure/supabase/supabaseClient";
import { getMockStore } from "@hemdem/core/infrastructure/mock/mockStore";
import {
  emailFor,
  passwordFor,
  buildProfileRows,
  buildTestRow,
  buildAnswerRows,
  buildSwipeRows,
  buildMatchRows,
  buildChatRow,
  buildMessageRows,
  buildPostRows,
  buildNoteRows,
  buildProfileViewRows,
  buildNotificationRows,
  buildCoinRows,
  buildPointRows,
} from "./lib/buildDemoRows.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEMO_EMAIL_DOMAIN = "demo.hemdem.test";
const RESET = process.argv.includes("--reset");

function loadEnvLocal() {
  const envPath = join(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

async function listAllUsers(client) {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 200) break;
  }
  return users;
}

async function resetDemoUsers(client) {
  const users = await listAllUsers(client);
  const demoUsers = users.filter(
    (u) => u.email?.endsWith(`@${DEMO_EMAIL_DOMAIN}`) || u.email === "demo@hemdem.test" || u.email === "admin@hemdem.test"
  );
  for (const user of demoUsers) {
    const { error } = await client.auth.admin.deleteUser(user.id);
    if (error) throw error;
  }
  console.log(`[reset] ${demoUsers.length} eski demo hesabı silindi (bağlı tüm veriler cascade ile gitti).`);
}

/** E-postayı zaten varsa yeniden kullanır, yoksa oluşturur — script tekrar çalıştırılabilir olur. */
async function ensureAuthUser(client, email, password, allUsers) {
  const existing = allUsers.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) return existing.id;

  const { data, error } = await client.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  return data.user.id;
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error(
      "Eksik ortam değişkeni: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.\n" +
        "apps/web/.env.local dosyasında bulunmalılar (bkz. supabase/README.md)."
    );
    process.exit(1);
  }
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.warn(
      "[uyarı] NEXT_PUBLIC_USE_MOCK_DATA=true ayarlı — bu script yine de GERÇEK Supabase'e yazar, " +
        "sadece uygulamanın kendisi mock modda kalır. Devam ediliyor.\n"
    );
  }

  const client = createSupabaseServerClient({ url, serviceRoleKey });
  const store = getMockStore();

  if (RESET) {
    await resetDemoUsers(client);
  }

  // --- 1) Auth kullanıcıları + profiller -------------------------------
  const allUsers = await listAllUsers(client);
  const userIdMap = new Map(); // mock key ("demo-user-1") -> gerçek uuid

  for (const profile of store.profiles.values()) {
    const realId = await ensureAuthUser(client, emailFor(profile), passwordFor(profile), allUsers);
    userIdMap.set(profile.id, realId);
  }
  console.log(`[1/11] ${userIdMap.size} auth kullanıcısı hazır.`);

  const profileRows = buildProfileRows(store, userIdMap);
  {
    const { error } = await client.from("profiles").upsert(profileRows, { onConflict: "id" });
    if (error) throw error;
  }
  console.log(`[2/11] ${profileRows.length} profil yazıldı.`);

  // --- 2) Testler (profillerden sonra: created_by FK'si var) ----------
  // `gate_test_id` FK'sinde ON DELETE tanımlı değil (varsayılan RESTRICT),
  // yani script tekrar çalıştırıldığında bir önceki koşudan kalan testi
  // hâlâ işaret eden bir profil varsa test silinemez. Script her
  // çalıştığında testleri temiz baştan yazdığı için önce bu referansı
  // sıfırlıyoruz, testleri silip yeniden oluşturuyoruz, en son tekrar
  // bağlıyoruz — bu script tek doğru kaynağı olduğundan idempotent olması
  // (--reset olmadan tekrar tekrar çalıştırılabilmesi) önemli.
  const demoUserIds = [...userIdMap.values()];
  {
    const { error } = await client
      .from("profiles")
      .update({ gate_test_id: null })
      .in("id", demoUserIds);
    if (error) throw error;
  }
  {
    const { error } = await client.from("tests").delete().in("created_by", demoUserIds);
    if (error) throw error;
  }

  const testIdMap = new Map();
  for (const test of store.tests.values()) {
    const { data, error } = await client
      .from("tests")
      .insert(buildTestRow(test, userIdMap))
      .select("id")
      .single();
    if (error) throw error;
    testIdMap.set(test.id, data.id);
  }
  console.log(`[3/11] ${testIdMap.size} test yazıldı.`);

  for (const profile of store.profiles.values()) {
    if (!profile.gateTestId) continue;
    const { error } = await client
      .from("profiles")
      .update({ gate_test_id: testIdMap.get(profile.gateTestId) })
      .eq("id", userIdMap.get(profile.id));
    if (error) throw error;
  }

  // --- 3) Cevaplar ------------------------------------------------------
  const answerRows = buildAnswerRows(store, userIdMap, testIdMap);
  if (answerRows.length > 0) {
    const { error } = await client.from("answers").upsert(answerRows, { onConflict: "user_id,test_id" });
    if (error) throw error;
  }
  console.log(`[4/11] ${answerRows.length} cevap yazıldı.`);

  // --- 4) Swipe'lar -------------------------------------------------------
  const swipeRows = buildSwipeRows(store, userIdMap);
  if (swipeRows.length > 0) {
    const { error } = await client.from("swipes").upsert(swipeRows, { onConflict: "from_user,to_user" });
    if (error) throw error;
  }
  console.log(`[5/11] ${swipeRows.length} kaydırma yazıldı.`);

  // --- 5) Eşleşmeler ------------------------------------------------------
  const matchRows = buildMatchRows(store, userIdMap);
  if (matchRows.length > 0) {
    const { error } = await client.from("matches").upsert(matchRows, { onConflict: "user_a,user_b" });
    if (error) throw error;
  }
  console.log(`[6/11] ${matchRows.length} eşleşme yazıldı.`);

  // --- 6) Sohbetler + mesajlar -------------------------------------------
  const chatIdMap = new Map(); // mock chat.id (1, 2, ...) -> gerçek bigint id
  for (const chat of store.chats.values()) {
    const { data, error } = await client
      .from("chats")
      .upsert(buildChatRow(chat, userIdMap), { onConflict: "user_a,user_b" })
      .select("id")
      .single();
    if (error) throw error;
    chatIdMap.set(chat.id, data.id);
  }
  console.log(`[7/11] ${chatIdMap.size} sohbet yazıldı.`);

  const messageRows = buildMessageRows(store, userIdMap, chatIdMap);
  if (messageRows.length > 0) {
    // Mesajlarda doğal bir unique anahtar yok; script yeniden çalıştırıldığında
    // aynı sohbete tekrar eklenmesinler diye önce o sohbetlerin mesajları silinir.
    const chatIds = [...new Set(messageRows.map((m) => m.chat_id))];
    const { error: delError } = await client.from("messages").delete().in("chat_id", chatIds);
    if (delError) throw delError;
    const { error } = await client.from("messages").insert(messageRows);
    if (error) throw error;
  }
  console.log(`[8/11] ${messageRows.length} mesaj yazıldı.`);

  // --- 7) Gönderiler + notlar + profil görüntülemeleri -------------------
  const postRows = buildPostRows(store, userIdMap, testIdMap);
  const postAuthorIds = [...new Set(postRows.map((p) => p.user_id))];
  if (postAuthorIds.length > 0) {
    const { error: delError } = await client.from("posts").delete().in("user_id", postAuthorIds);
    if (delError) throw delError;
  }
  if (postRows.length > 0) {
    const { error } = await client.from("posts").insert(postRows);
    if (error) throw error;
  }
  console.log(`[9/11] ${postRows.length} gönderi yazıldı.`);

  const noteRows = buildNoteRows(store, userIdMap);
  const noteAuthorIds = [...new Set(noteRows.map((n) => n.user_id))];
  if (noteAuthorIds.length > 0) {
    const { error: delError } = await client.from("notes").delete().in("user_id", noteAuthorIds);
    if (delError) throw delError;
  }
  if (noteRows.length > 0) {
    const { error } = await client.from("notes").insert(noteRows);
    if (error) throw error;
  }

  const viewRows = buildProfileViewRows(store, userIdMap);
  if (viewRows.length > 0) {
    const { error } = await client.from("profile_views").upsert(viewRows, { onConflict: "viewer_id,viewed_id" });
    if (error) throw error;
  }
  console.log(`[10/11] ${noteRows.length} not, ${viewRows.length} profil görüntülemesi yazıldı.`);

  // --- 8) Bildirimler + coin/puan ----------------------------------------
  const notificationRows = buildNotificationRows(store, userIdMap, testIdMap);
  const notifiedUserIds = [...new Set(notificationRows.map((n) => n.user_id))];
  if (notifiedUserIds.length > 0) {
    const { error: delError } = await client.from("notifications").delete().in("user_id", notifiedUserIds);
    if (delError) throw delError;
  }
  if (notificationRows.length > 0) {
    const { error } = await client.from("notifications").insert(notificationRows);
    if (error) throw error;
  }

  const coinRows = buildCoinRows(store, userIdMap);
  if (coinRows.length > 0) {
    const { error } = await client.from("user_coins").upsert(coinRows, { onConflict: "user_id" });
    if (error) throw error;
  }
  const pointRows = buildPointRows(store, userIdMap);
  if (pointRows.length > 0) {
    const { error } = await client.from("user_points").upsert(pointRows, { onConflict: "user_id" });
    if (error) throw error;
  }
  console.log(`[11/11] ${notificationRows.length} bildirim, ${coinRows.length} coin, ${pointRows.length} puan kaydı yazıldı.`);

  console.log("\n✔ Demo veri gerçek Supabase projesine yazıldı.\n");
  console.log("Giriş yapabileceğin hesaplar:");
  console.log(`  demo@hemdem.test / demo1234        (${store.profiles.get("demo-user-1").name})`);
  console.log(`  admin@hemdem.test / admin1234      (yönetici)`);
  console.log(`  <isim>@${DEMO_EMAIL_DOMAIN} / Demo1234!   (diğer 11 demo profil, ör. ece-yilmaz@${DEMO_EMAIL_DOMAIN})`);
  console.log("\nTemiz bir baştan başlamak için: node scripts/seed-supabase-demo.mjs --reset");
}

main().catch((error) => {
  console.error("\n✘ Seed başarısız:", error);
  process.exit(1);
});
