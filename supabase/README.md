# Supabase Kurulumu

1. Yeni bir Supabase projesi oluştur.
2. **Tüm migration dosyalarını sırayla** SQL Editor'de çalıştır (veya
   `supabase db push`) — **hiçbirini atlama**, aksi hâlde ilgili tablo
   gerçek projede hiç var olmaz ve o tabloyu okuyan her sayfa (bazen
   uygulamanın tamamı) hata verir:
   - `migrations/0001_init.sql` — çekirdek şema (profiller, testler,
     sohbetler, coin/puan, …).
   - `migrations/0002_add_social_links.sql` — profillere sosyal medya
     linkleri kolonu.
   - `migrations/0003_notifications.sql` — bildirimler tablosu. Bu
     çalıştırılmadan `(app)` kabuğundaki bildirim rozeti ve
     `/bildirimler` sayfası veri okuyamaz. Uygulama artık bu hatayı
     yakalayıp sessizce 0/boş bildirim gösterecek şekilde dayanıklı
     (bkz. `apps/web/lib/notifications.js`), yani site çökmez — ama
     bildirimler de asla gelmez, tablo gerçekten oluşana kadar.
   - Yeni bir migration eklendiğinde bu listeyi de güncelle; kod
     deploy edilir edilmez migration'ın da aynı anda gerçek projeye
     uygulanması gerekir, ikisi ayrı adımdır ve biri unutulabilir.
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
6. **(İsteğe bağlı) Demo veri**: sayfalar boş görünmesin diye
   `migrations/0004_seed_demo_data.sql`'i de SQL Editor'de çalıştır —
   0001-0003'ün aksine bu zorunlu değil, sadece 13 profil/8 test/
   gönderi/sohbet/bildirim ekler. Detaylar ve alternatif (Node script)
   için bkz. [`../apps/web/scripts/README.md`](../apps/web/scripts/README.md).

## RLS notu

Tüm tablolarda RLS açık ve **hiçbir policy tanımlı değil** (varsayılan
reddet). Uygulama kodu her zaman `service role` key ile çalıştığı için bu
kısıtlama by-pass edilir; asıl amaç, biri yanlışlıkla tarayıcıdan `anon
key` ile doğrudan Supabase'e istek atarsa hiçbir satırın okunup
yazılamamasını garanti etmektir.
