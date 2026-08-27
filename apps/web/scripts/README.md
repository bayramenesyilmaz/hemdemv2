# Demo veri seed script'i

Mock modda (`NEXT_PUBLIC_USE_MOCK_DATA=true`) gördüğün 13 profil, 8 uyum
testi, gönderiler, sohbetler ve bildirimler tamamen bellek içindedir —
gerçek Supabase projene otomatik olarak taşınmaz. Bu script aynı veriyi
gerçek projene yazar, böylece canlıya çıktığında sayfalar boş görünmez.

## Önkoşul

`supabase/migrations/` altındaki **üç** migration da gerçek projene
uygulanmış olmalı (bkz. `supabase/README.md`). Özellikle
`0003_notifications.sql` eksikse script `notifications` tablosuna
yazamadığı için hata verir.

`apps/web/.env.local` içinde `NEXT_PUBLIC_SUPABASE_URL` ve
`SUPABASE_SERVICE_ROLE_KEY` dolu olmalı.

## Kullanım

```bash
cd apps/web
node scripts/seed-supabase-demo.mjs           # var olan demo hesapları yeniden kullanır
node scripts/seed-supabase-demo.mjs --reset   # önce tüm demo hesapları silip baştan oluşturur
```

veya kök dizinden:

```bash
pnpm --filter @hemdem/web seed:demo
pnpm --filter @hemdem/web seed:demo:reset
```

Script tekrar tekrar çalıştırılabilir (idempotent): aynı e-postalarla
zaten var olan hesapları bulup yeniden kullanır, testleri/gönderileri/
bildirimleri her seferinde temiz baştan yazar. Hiçbir zaman gerçek
kullanıcı verisine dokunmaz — sadece `@demo.hemdem.test` uzantılı
e-postaları (+ bilinen `demo@hemdem.test` / `admin@hemdem.test`) yönetir.

## Giriş bilgileri

Script sonunda ekrana yazdırılır:

- `demo@hemdem.test` / `demo1234` — mock moddaki ile aynı ana demo hesap
- `admin@hemdem.test` / `admin1234` — yönetici paneli için
- `<isim>@demo.hemdem.test` / `Demo1234!` — diğer 11 demo profil (ör.
  `ece-yilmaz@demo.hemdem.test`)

Bu hesaplar gerçek Supabase Auth'ta oluşturulur; login sayfasından normal
şekilde giriş yapabilirsin.

## Nasıl doğrulandı

Bu script gerçek bir Supabase projesine karşı çalıştırılamadı (kimlik
bilgisi paylaşılmadı), ama satır üretim mantığı hem saf birim testlerle
hem de yerel bir PostgreSQL 16'ya üç migration'ı da uygulayıp seed
akışını iki kez art arda çalıştıran bir entegrasyon testiyle doğrulandı
(FK/UNIQUE/CHECK kısıtları dahil, ikinci çalıştırma hiçbir satırı
ikiye katlamadı). Gerçek Supabase Auth Admin API'si bu ortamda mevcut
olmadığından auth.users tarafı taklit edildi; ilk gerçek çalıştırmada
yine de sonucu ekrandaki özet log'lardan kontrol et.
