# Demo veri

Mock modda (`NEXT_PUBLIC_USE_MOCK_DATA=true`) gördüğün 13 profil, 8 uyum
testi, gönderiler, sohbetler ve bildirimler tamamen bellek içindedir —
gerçek Supabase projene otomatik olarak taşınmaz. Aynı veriyi gerçek
projene yazmanın iki yolu var:

## Yol 1: SQL migration (önerilen — Node kurulumu gerekmez)

`supabase/migrations/0004_seed_demo_data.sql`'i, diğer migration'lar gibi
SQL Editor'de çalıştır (veya `supabase db push`).

**Nasıl çalışır:** `auth.users` ve `auth.identities`'e doğrudan satır
ekler (şifreler `pgcrypto`'nun `crypt()`'i ile hash'lenir), sonra tüm
demo profil/test/cevap/gönderi/sohbet/bildirim verisini yazar. Sabit
(dosyaya gömülü) id'ler kullandığı için **tekrar çalıştırılabilir** —
her seferinde önce kendi demo verisini silip temiz baştan yazar, gerçek
kullanıcı verisine dokunmaz.

**Sınırı:** `auth.users`'a elle yazmak Supabase'in resmi desteklediği bir
yol değil — yaygın bilinen ama gayrı resmi bir teknik. Bu repodaki
migration'lar için yerel bir PostgreSQL 16'da gerçek şemaya (üretken
`confirmed_at`/`email` kolonları dahil) karşı iki kez üst üste
çalıştırılarak doğrulandı, ama Supabase'in auth şeması sürüm sürüm
değişebilir. Migration'ı çalıştırdıktan sonra `demo@hemdem.test` /
`demo1234` ile giriş dener gibi hızlıca dene; "Invalid login
credentials" alırsan aşağıdaki Yol 2'ye geç.

## Yol 2: Node script (resmi Admin API, her sürümde çalışır)

```bash
cd apps/web
node scripts/seed-supabase-demo.mjs           # var olan demo hesapları yeniden kullanır
node scripts/seed-supabase-demo.mjs --reset   # önce tüm demo hesapları silip baştan oluşturur
```

veya kök dizinden `pnpm --filter @hemdem/web seed:demo`.

`apps/web/.env.local` içinde `NEXT_PUBLIC_SUPABASE_URL` ve
`SUPABASE_SERVICE_ROLE_KEY` dolu olmalı. Supabase Auth Admin API'sini
kullanır, yani Supabase sürümünden bağımsız her zaman çalışır — SQL
yolu bir nedenle tutmazsa güvenilir yedek budur.

## Ortak önkoşul

Hangi yolu seçersen seç, `supabase/migrations/` altındaki **0001-0003**
migration'ları gerçek projene uygulanmış olmalı (bkz.
`supabase/README.md`). Özellikle `0003_notifications.sql` eksikse
`notifications` tablosu olmadığı için yazma başarısız olur.

## Giriş bilgileri

Her iki yol da aynı hesapları oluşturur:

- `demo@hemdem.test` / `demo1234` — mock moddaki ile aynı ana demo hesap
- `admin@hemdem.test` / `admin1234` — yönetici paneli için
- `<isim>@demo.hemdem.test` / `Demo1234!` — diğer 11 demo profil (ör.
  `ece-yilmaz@demo.hemdem.test`)

## Nasıl doğrulandı

Her iki yöntem de gerçek bir Supabase projesine karşı çalıştırılamadı
(kimlik bilgisi paylaşılmadı). Bunun yerine:

- Satır üretim mantığı (`scripts/lib/buildDemoRows.mjs`) saf birim
  testlerle doğrulandı.
- Her iki yöntem de yerel bir PostgreSQL 16'ya bu repodaki tüm
  migration'lar (0001-0004) uygulanıp seed akışı iki kez art arda
  çalıştırılarak test edildi (FK/UNIQUE/CHECK kısıtları dahil — SQL
  yolu için ayrıca gerçekçi bir `auth.users`/`auth.identities` şema
  taklidi kuruldu, şifre hash'i `crypt()` karşılaştırmasıyla
  doğrulandı). İkinci çalıştırma hiçbir satırı ikiye katlamadı.
- Bu süreçte SQL üretecinde iki gerçek hata bulundu ve düzeltildi:
  sohbet id'leri için geçersiz SQL değişken adı üretimi (mock anahtarı
  "demo-user-1:demo-user-2" kullanılıyordu, sayısal id yerine) ve
  testlerin tekrar çalıştırmada `created_by` FK'si `ON DELETE SET
  NULL` olduğu için silinmeyip birincil anahtar çakışması yaratması.
- Gerçek Supabase Auth Admin API'si bu ortamda mevcut olmadığından her
  iki yöntemde de auth.users tarafı taklit edildi; ilk gerçek
  çalıştırmada demo hesaplardan biriyle giriş deneyerek sonucu
  doğrula.
