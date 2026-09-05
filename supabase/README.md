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
   - `migrations/0005_leaderboard_rewards.sql` — puan kazanımlarının
     zaman damgalı logu (`point_events`) ve periyodik liderlik
     ödüllerinin tekrar verilmesini engelleyen kayıt tablosu
     (`leaderboard_reward_grants`). Bu çalıştırılmadan
     `/api/cron/leaderboard-rewards` hata verir.
   - `migrations/0006_blocking.sql` — engelleme/şikayet tabloları
     (`blocks`, `reports`). Bu çalıştırılmadan engelleme/şikayet
     özelliği ve admin talepler sayfası hata verir.
   - `migrations/0007_engagement_features.sql` — çevrimiçi durumu,
     profil fotoğraf galerisi, boost, profil doğrulama, mesaj
     "Görüldü" (`chat_reads`) ve Günün Eşleşmesi (`daily_matches`)
     için gereken tüm kolonlar/tablolar + genişletilmiş bildirim tipi
     kısıtı. Bu çalıştırılmadan profil sayfası, keşfet ve
     `/api/cron/daily-match` hata verir.
   - Yeni bir migration eklendiğinde bu listeyi de güncelle; kod
     deploy edilir edilmez migration'ın da aynı anda gerçek projeye
     uygulanması gerekir, ikisi ayrı adımdır ve biri unutulabilir.
3. Database → Extensions altında `pg_cron` extension'ını aç (migration
   `create extension if not exists pg_cron` ile bunu dener, ama bazı
   planlarda extension'ın panelden manuel açılması gerekebilir) — bu,
   `0001_init.sql`'in sonundaki haftalık hareketsiz-sohbet temizliği
   (`cron.schedule(...)`) için gerekli.
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

## Periyodik cron uçları (Vercel Cron)

Bu, yukarıdaki `pg_cron`'dan bağımsız ayrı bir mekanizma — Supabase
tarafında ekstra bir şey açman gerekmiyor. İki uç var:
- `apps/web/app/api/cron/leaderboard-rewards/route.js` — ilk 3
  kullanıcıya günlük/3 günlük/haftalık coin ödülü.
- `apps/web/app/api/cron/daily-match/route.js` — her kullanıcı için
  günün eşleşmesini hesaplar (TR saatiyle sabah 07:00).

Tetikleyici her ikisi için de `apps/web/vercel.json`'daki cron
tanımlarıdır (Vercel deploy sırasında bunları otomatik kaydeder, elle
bir şey yapman gerekmez — proje Hobby planındaysa günde en fazla iki
cron sınırı bu iki girişe zaten uyuyor).

Tek yapman gereken: Vercel proje ayarlarına rastgele, uzun bir
`CRON_SECRET` ortam değişkeni eklemek (her iki uç da aynı değişkeni
okur). Vercel cron istekleri bu değeri
`Authorization: Bearer <CRON_SECRET>` header'ı olarak otomatik gönderir;
uç bu header'ı kontrol ederek isteğin gerçekten Vercel'den geldiğini
doğrular. `CRON_SECRET` tanımlı değilse uç doğrulamayı atlar (yerel
geliştirmede elle test edebilmek için) — üretimde mutlaka ayarla.

## RLS notu

Tüm tablolarda RLS açık ve **hiçbir policy tanımlı değil** (varsayılan
reddet). Uygulama kodu her zaman `service role` key ile çalıştığı için bu
kısıtlama by-pass edilir; asıl amaç, biri yanlışlıkla tarayıcıdan `anon
key` ile doğrudan Supabase'e istek atarsa hiçbir satırın okunup
yazılamamasını garanti etmektir.
