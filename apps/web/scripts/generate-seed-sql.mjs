#!/usr/bin/env node
/**
 * `getMockStore()`'daki demo veriyi (13 profil, 8 uyum testi, cevaplar,
 * gönderiler, sohbetler, bildirimler…) tek seferlik, saf SQL'e çevirir.
 * Çıktı `supabase/migrations/0004_seed_demo_data.sql`'a yazılır.
 *
 * Bu script'in kendisi Supabase'e bağlanmaz — hiçbir ağ çağrısı yapmaz,
 * sadece mock store'u okuyup metin üretir. Üretilen SQL, kullanıcının
 * SQL Editor'de veya `supabase db push` ile çalıştıracağı statik bir
 * migration dosyasıdır.
 *
 * Neden auth.users'a doğrudan INSERT: Supabase'in resmi yolu Admin API
 * (bkz. seed-supabase-demo.mjs) ama kullanıcı SQL'i tercih etti. Bu,
 * GoTrue'nun kendi şemasına (instance_id, encrypted_password için
 * pgcrypto crypt(), email/password girişi için auth.identities satırı)
 * elle yazdığımız, resmi olarak desteklenmeyen ama yaygın bilinen bir
 * yöntemdir — Supabase projelerinin çoğu sürümünde çalışır ama
 * auth şeması değişirse (örn. yeni zorunlu bir kolon) bozulabilir. O
 * yüzden README'de "çalışmazsa seed-supabase-demo.mjs'e geç" notu var.
 *
 * Kullanım: node scripts/generate-seed-sql.mjs
 */

import { writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
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
  buildPostRows,
  buildNoteRows,
  buildProfileViewRows,
  buildNotificationRows,
  buildCoinRows,
  buildPointRows,
} from "./lib/buildDemoRows.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "..", "..", "supabase", "migrations", "0004_seed_demo_data.sql");

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  if (value === null || value === undefined) return "null";
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

function sqlBool(value) {
  return value ? "true" : "false";
}

function sqlNumber(value) {
  return value === null || value === undefined ? "null" : String(value);
}

function sqlValues(rows, columns) {
  return rows.map((row) => `  (${columns.map((c) => c(row)).join(", ")})`).join(",\n");
}

function main() {
  const store = getMockStore();

  // Mock anahtarı -> sabit uuid. Script yeniden çalıştırıldığında AYNI
  // dosyayı üretir (idempotent üretim); id'ler burada bir kez rastgele
  // seçilip metne gömülür, bir daha değişmez.
  const userIdMap = new Map([...store.profiles.keys()].map((k) => [k, randomUUID()]));
  const testIdMap = new Map([...store.tests.keys()].map((k) => [k, randomUUID()]));
  // store.chats bileşik string anahtarla ("demo-user-1:demo-user-2") tutulur;
  // SQL değişken adı için chat'in kendi sayısal id'si kullanılmalı, Map
  // anahtarı değil — aksi hâlde "v_chat_demo-user-1:demo-user-2_id" gibi
  // geçersiz bir tanımlayıcı üretilir.
  const chatNumericIds = [...store.chats.values()].map((c) => c.id);

  const lines = [];
  lines.push(
    "-- Demo/seed veri: mock modda görülen 13 profil, 8 uyum testi, cevaplar,",
    "-- gönderiler, sohbetler ve bildirimleri gerçek Supabase projesine yazar.",
    "-- apps/web/scripts/generate-seed-sql.mjs tarafından üretildi — elle",
    "-- düzenleme yapma, script'i tekrar çalıştır.",
    "--",
    "-- ÖNEMLİ: auth.users / auth.identities'e doğrudan INSERT, Supabase'in",
    "-- resmi desteklediği bir yol DEĞİL (community'de yaygın kullanılan bir",
    "-- teknik). Eğer bu migration'ı çalıştırdıktan sonra demo hesaplarla",
    "-- giriş yapamıyorsan (\"Invalid login credentials\" hatası), auth şeman",
    "-- bu satırların varsaydığı kolonlardan farklı demektir — bu durumda",
    "-- apps/web/scripts/seed-supabase-demo.mjs'i kullan (resmi Admin API,",
    "-- her Supabase sürümünde çalışır).",
    "--",
    "-- Tekrar çalıştırılabilir (idempotent): var olan demo hesapları/",
    "-- verileri siler, aynı sabit id'lerle yeniden oluşturur.",
    "",
    "do $$",
    "declare",
    "  v_password_hash text;",
    "begin",
    ""
  );

  // --- 1) auth.users + auth.identities -----------------------------------
  lines.push("  -- 1) Demo kullanıcıları (auth.users + auth.identities) ------------------");
  lines.push("  -- Önce varsa temizle (cascade ile profiles ve bağlı her şeyi de siler).");
  const demoUserIds = [...userIdMap.values()];
  lines.push(
    `  delete from auth.users where id in (${demoUserIds.map((id) => `'${id}'`).join(", ")});`,
    ""
  );

  for (const profile of store.profiles.values()) {
    const id = userIdMap.get(profile.id);
    const email = emailFor(profile);
    const password = passwordFor(profile);
    lines.push(
      `  v_password_hash := crypt(${sqlString(password)}, gen_salt('bf'));`,
      `  insert into auth.users (`,
      `    instance_id, id, aud, role, email, encrypted_password,`,
      `    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,`,
      `    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token`,
      `  ) values (`,
      `    '00000000-0000-0000-0000-000000000000', '${id}', 'authenticated', 'authenticated',`,
      `    ${sqlString(email)}, v_password_hash,`,
      `    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,`,
      `    now(), now(), '', '', '', ''`,
      `  );`,
      `  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)`,
      `  values (`,
      `    gen_random_uuid(), '${id}', '${id}',`,
      `    format('{"sub":"%s","email":"%s"}', '${id}', ${sqlString(email)})::jsonb,`,
      `    'email', now(), now(), now()`,
      `  );`,
      ""
    );
  }

  lines.push("end $$;", "");

  // --- 2) profiles ---------------------------------------------------------
  const profileRows = buildProfileRows(store, userIdMap);
  lines.push(
    "-- 2) Profiller ------------------------------------------------------------",
    "insert into public.profiles (id, created_at, name, avatar_url, bio, gender, country, interested_in, birthdate, language, role, is_banned, gate_test_threshold, allow_guest_likes, social_links)",
    "values",
    sqlValues(profileRows, [
      (r) => sqlString(r.id),
      (r) => sqlString(r.created_at),
      (r) => sqlString(r.name),
      (r) => sqlString(r.avatar_url),
      (r) => sqlString(r.bio),
      (r) => sqlString(r.gender),
      (r) => sqlString(r.country),
      (r) => sqlString(r.interested_in),
      (r) => sqlString(r.birthdate),
      (r) => sqlString(r.language),
      (r) => sqlString(r.role),
      (r) => sqlBool(r.is_banned),
      (r) => sqlNumber(r.gate_test_threshold),
      (r) => sqlBool(r.allow_guest_likes),
      (r) => sqlJson(r.social_links),
    ]) + ";",
    ""
  );

  // --- 3) tests --------------------------------------------------------------
  // `tests.created_by` FK'si ON DELETE SET NULL'dır (cascade değil), yani
  // auth.users silinince profiles gider ama testler created_by=null olarak
  // hayatta kalır. Aynı sabit id ile yeniden insert etmeye çalışınca
  // primary key çakışması olur — script tekrar çalıştırılabilir olsun diye
  // önce bu ID'lerle eski testleri temizliyoruz.
  const demoTestIds = [...testIdMap.values()];
  lines.push(
    "-- 3) Testler ---------------------------------------------------------------",
    `delete from public.tests where id in (${demoTestIds.map((id) => `'${id}'`).join(", ")});`,
    ""
  );
  for (const test of store.tests.values()) {
    const row = buildTestRow(test, userIdMap);
    const id = testIdMap.get(test.id);
    lines.push(
      `insert into public.tests (id, created_at, created_by, title, category_id, language, questions, point, approved, is_deleted)`,
      `values (${sqlString(id)}, ${sqlString(row.created_at)}, ${sqlString(row.created_by)}, ${sqlString(row.title)}, ${sqlNumber(row.category_id)}, ${sqlString(row.language)}, ${sqlJson(row.questions)}, ${sqlNumber(row.point)}, ${sqlBool(row.approved)}, ${sqlBool(row.is_deleted)});`
    );
  }
  lines.push("");

  // gate_test_id (testlerden sonra, FK sırası gereği)
  lines.push("-- Kapı testi referansları (testler oluştuktan sonra bağlanır)");
  for (const profile of store.profiles.values()) {
    if (!profile.gateTestId) continue;
    lines.push(
      `update public.profiles set gate_test_id = ${sqlString(testIdMap.get(profile.gateTestId))} where id = ${sqlString(userIdMap.get(profile.id))};`
    );
  }
  lines.push("");

  // --- 4) answers --------------------------------------------------------------
  const answerRows = buildAnswerRows(store, userIdMap, testIdMap);
  lines.push(
    "-- 4) Cevaplar ---------------------------------------------------------------",
    "insert into public.answers (created_at, user_id, test_id, user_answers)",
    "values",
    sqlValues(answerRows, [
      (r) => sqlString(r.created_at),
      (r) => sqlString(r.user_id),
      (r) => sqlString(r.test_id),
      (r) => sqlJson(r.user_answers),
    ]) + ";",
    ""
  );

  // --- 5) swipes --------------------------------------------------------------
  const swipeRows = buildSwipeRows(store, userIdMap);
  lines.push(
    "-- 5) Kaydırmalar ------------------------------------------------------------",
    "insert into public.swipes (created_at, from_user, to_user, action)",
    "values",
    sqlValues(swipeRows, [
      (r) => sqlString(r.created_at),
      (r) => sqlString(r.from_user),
      (r) => sqlString(r.to_user),
      (r) => sqlString(r.action),
    ]) + ";",
    ""
  );

  // --- 6) matches ---------------------------------------------------------
  const matchRows = buildMatchRows(store, userIdMap);
  lines.push(
    "-- 6) Eşleşmeler ---------------------------------------------------------",
    "insert into public.matches (created_at, user_a, user_b)",
    "values",
    sqlValues(matchRows, [
      (r) => sqlString(r.created_at),
      (r) => sqlString(r.user_a),
      (r) => sqlString(r.user_b),
    ]) + ";",
    ""
  );

  // --- 7) chats + messages --------------------------------------------------
  lines.push("-- 7) Sohbetler + mesajlar -------------------------------------------------");
  lines.push("do $$");
  lines.push("declare");
  for (const chatId of chatNumericIds) {
    lines.push(`  v_chat_${chatId}_id bigint;`);
  }
  lines.push("begin");
  for (const chat of store.chats.values()) {
    const row = buildChatRow(chat, userIdMap);
    lines.push(
      `  insert into public.chats (created_at, last_message_at, user_a, user_b, source)`,
      `  values (${sqlString(row.created_at)}, ${sqlString(row.last_message_at)}, ${sqlString(row.user_a)}, ${sqlString(row.user_b)}, ${sqlString(row.source)})`,
      `  returning id into v_chat_${chat.id}_id;`
    );
  }
  for (const message of store.messages) {
    lines.push(
      `  insert into public.messages (created_at, chat_id, sender_id, content)`,
      `  values (${sqlString(message.createdAt)}, v_chat_${message.chatId}_id, ${sqlString(userIdMap.get(message.senderId))}, ${sqlString(message.content)});`
    );
  }
  lines.push("end $$;", "");

  // --- 8) posts + notes + profile_views ---------------------------------
  const postRows = buildPostRows(store, userIdMap, testIdMap);
  lines.push(
    "-- 8) Gönderiler -------------------------------------------------------------",
    "insert into public.posts (created_at, user_id, content, tagged_test_id)",
    "values",
    sqlValues(postRows, [
      (r) => sqlString(r.created_at),
      (r) => sqlString(r.user_id),
      (r) => sqlString(r.content),
      (r) => sqlString(r.tagged_test_id),
    ]) + ";",
    ""
  );

  const noteRows = buildNoteRows(store, userIdMap);
  if (noteRows.length > 0) {
    lines.push(
      "-- Notlar",
      "insert into public.notes (created_at, user_id, text)",
      "values",
      sqlValues(noteRows, [
        (r) => sqlString(r.created_at),
        (r) => sqlString(r.user_id),
        (r) => sqlString(r.text),
      ]) + ";",
      ""
    );
  }

  const viewRows = buildProfileViewRows(store, userIdMap);
  lines.push(
    "-- Profil görüntülemeleri",
    "insert into public.profile_views (created_at, viewer_id, viewed_id)",
    "values",
    sqlValues(viewRows, [
      (r) => sqlString(r.created_at),
      (r) => sqlString(r.viewer_id),
      (r) => sqlString(r.viewed_id),
    ]) + ";",
    ""
  );

  // --- 9) notifications + coins + points ---------------------------------
  const notificationRows = buildNotificationRows(store, userIdMap, testIdMap);
  lines.push(
    "-- 9) Bildirimler ------------------------------------------------------------",
    "insert into public.notifications (created_at, user_id, type, actor_id, test_id, similarity, is_read)",
    "values",
    sqlValues(notificationRows, [
      (r) => sqlString(r.created_at),
      (r) => sqlString(r.user_id),
      (r) => sqlString(r.type),
      (r) => sqlString(r.actor_id),
      (r) => sqlString(r.test_id),
      (r) => sqlNumber(r.similarity),
      (r) => sqlBool(r.is_read),
    ]) + ";",
    ""
  );

  const coinRows = buildCoinRows(store, userIdMap);
  lines.push(
    "-- Coin bakiyeleri",
    "insert into public.user_coins (user_id, coin)",
    "values",
    sqlValues(coinRows, [(r) => sqlString(r.user_id), (r) => sqlNumber(r.coin)]) + ";",
    ""
  );

  const pointRows = buildPointRows(store, userIdMap);
  lines.push(
    "-- Puan bakiyeleri",
    "insert into public.user_points (user_id, point)",
    "values",
    sqlValues(pointRows, [(r) => sqlString(r.user_id), (r) => sqlNumber(r.point)]) + ";",
    ""
  );

  lines.push(
    "-- Giriş yapabileceğin hesaplar:",
    "--   demo@hemdem.test / demo1234",
    "--   admin@hemdem.test / admin1234",
    "--   <isim>@demo.hemdem.test / Demo1234!  (diğer 11 demo profil)"
  );

  writeFileSync(OUT_PATH, lines.join("\n") + "\n", "utf8");
  console.log(`Yazıldı: ${OUT_PATH}`);
}

main();
