# Supabase Kurulumu

1. Yeni bir Supabase projesi oluştur.
2. `migrations/0001_init.sql` dosyasını SQL Editor'de veya
   `supabase db push` ile çalıştır.
3. Database → Extensions altında `pg_cron` extension'ını aç (migration
   `create extension if not exists pg_cron` ile bunu dener, ama bazı
   planlarda extension'ın panelden manuel açılması gerekebilir).
4. Storage → yeni bucket: `avatars` (public read, 1 GB ücretsiz kota —
   görsel boyutunu yükleme öncesi istemci tarafında sınırla/optimize et).
5. Project Settings → API'den şu değerleri al:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**asla** tarayıcıya
     gönderilmez, sadece sunucu tarafında/`.env` içinde kullanılır)

## RLS notu

Tüm tablolarda RLS açık ve **hiçbir policy tanımlı değil** (varsayılan
reddet). Uygulama kodu her zaman `service role` key ile çalıştığı için bu
kısıtlama by-pass edilir; asıl amaç, biri yanlışlıkla tarayıcıdan `anon
key` ile doğrudan Supabase'e istek atarsa hiçbir satırın okunup
yazılamamasını garanti etmektir.
