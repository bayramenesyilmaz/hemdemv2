# Hemdem v2 — AI Agent Rehberi

Bu dosya, bu repoda çalışan bir AI agent'ının (Claude Code dahil) projeyi
sıfırdan keşfetmeden hızlıca bağlam kazanması için yazıldı. Detaylı tarihsel
plan için `PLAN.md`'ye bakılabilir ama o dosya güncel tutulmuyor — buradaki
bilgi güncel kabul edilmeli.

## Proje ne

Türkçe kişilik testi + tanışma platformu. Testler bir bilgi sınavı değil:
doğru cevap yok, cevaplar aynı testi çözen başka kullanıcılarla karşılaştırılıp
uyum yüzdesi üretiyor. Bunun üzerine keşfet/swipe, eşleşme, mesajlaşma,
bildirimler, gönderiler, coin/puan sistemi ve bir admin panel kurulu.

## Monorepo yapısı

```
packages/core/            Framework'ten bağımsız domain + usecase + repository katmanı
  domain/entities/        Saf iş mantığı fonksiyonları (ör. benzerlik hesaplama, yaş aralığı)
  domain/repositories/    Repository interface tanımları (JSDoc)
  usecases/<alan>/        Her usecase tek bir dosya/fonksiyon (submitAnswers, likeUser, sendMessage, ...)
  infrastructure/mock/    In-memory sahte veri implementasyonu (bkz. aşağıda)
  infrastructure/supabase/ Gerçek Supabase implementasyonu (service-role client)

apps/web/                 Next.js 16 (App Router) + React 19 + Tailwind v4 + next-international (tr/en)
  app/[locale]/           Sayfalar; (app) route group'u giriş yapmış kullanıcı kabuğu
  lib/repositories.js     Mock/Supabase repository seçimi burada yapılır
  lib/actions/            Server actions (client formların çağırdığı)
  locales/tr.js, en.js    Çeviri sözlükleri

supabase/migrations/      SQL şema + RLS (sırayla 0001'den başlayarak uygulanır)
```

`packages/core` **hiçbir React/Next.js/React Native import etmez.** İleride
yazılacak `apps/mobile` (Expo/React Native) uygulaması aynı `usecases/*` ve
`infrastructure/supabase/*` kodunu doğrudan, değiştirmeden kullanacak — sadece
UI katmanı (ekranlar, navigasyon, gesture) yeniden yazılacak.

## Repository Pattern ve mock/Supabase geçişi

Her domain repository'nin iki implementasyonu var: `mock` (bellek içi, sahte
zengin seed veri) ve `supabase` (gerçek Postgres). Seçim `apps/web/lib/repositories.js`
ve `apps/web/proxy.js`'de `NEXT_PUBLIC_USE_MOCK_DATA` env değişkenine göre yapılıyor.

**Önemli:** `apps/web/next.config.mjs` bu değeri build zamanında zorluyor —
`VERCEL_ENV === "production"` olduğunda `NEXT_PUBLIC_USE_MOCK_DATA` ne
ayarlanmış olursa olsun `"false"`'a sabitleniyor. Yani gerçek production
build'i asla mock veriyle çalışamaz; mock modu sadece local geliştirme ve
preview build'lerde kullanılabilir. Bu, `.env`/Vercel panelinde unutulan bir
`true` değerinin production'da sahte veri sızdırmasını (ör. gerçek
kullanıcıların keşfette birbirini görememesi gibi bir hataya yol açmasını)
engellemek için eklendi — bkz. `next.config.mjs`'deki yorum.

Mock mod, agent'ların gerçek Supabase kimlik bilgilerine dokunmadan yerel
olarak uçtan uca test (Playwright dahil) yapabilmesi için var ve bilerek
korunuyor; production'da asla aktif olamayacağı garanti altına alındığı için
kaldırılmadı.

## Kritik güvenlik kuralları

- `SUPABASE_SERVICE_ROLE_KEY` **asla** `NEXT_PUBLIC_` öneki almaz ve tarayıcıya
  hiçbir şekilde gönderilmez. Tüm veritabanı erişimi server-side (server
  actions / route handlers) service-role client üzerinden yapılır.
- RLS tüm tablolarda açık ama **hiçbir policy yok** — bypass sadece
  service-role client ile. Bu bilinçli bir tasarım kararı, yeni policy
  eklemeden önce bunu bozmadığından emin ol.
- Asistan (Claude) kullanıcının gerçek Supabase kimlik bilgilerini asla
  istemez/işlemez — sadece kullanıcının kendisinin çalıştıracağı script'ler/
  migration'lar yazılır.

## Yerleşik "hataya dayanıklı yan etki" deseni

Bir usecase'in ana yazma işlemi (cevap kaydetme, mesaj gönderme, beğeni)
başarılı olduktan SONRA çalışan ikincil yan etkiler (bildirim oluşturma,
katılım puanı ekleme gibi) **asla** ana işlemin başarılı dönmesini
engellememeli. Aksi halde bildirim/puan tablosundaki geçici bir sorun, aslında
başarılı olan bir işlemi kullanıcıya hata olarak gösterir (yaşanmış gerçek bir
prod bug'ıydı — "gönderiliyor" durumunda sonsuza kadar takılı kalma).

Bu yüzden: `packages/core/usecases/notifications/safeCreateNotification.js`
gibi hataları yutan sarmalayıcılar kullanılıyor, ya da doğrudan yerinde
try/catch (bkz. `submitAnswers.js`). **Yeni bir yan etki eklerken bu deseni
takip et** — ana yazma işleminden sonraki her ek adım ayrı korunmalı.

## Konvansiyonlar

- Kod yorumları Türkçe, sadece **WHY** için (non-obvious kısıtlar, subtle
  invariant'lar) — WHAT için yorum yazılmaz, isimlendirme yeterli olmalı.
- Commit mesajları Türkçe, `Co-Authored-By` + `Claude-Session` footer'ıyla.
- Her zaman yeni commit — amend/force-push yok.
- Değişiklikten sonra: `pnpm --filter web lint` + `pnpm --filter web build`,
  mümkünse mock modda Playwright ile uçtan uca doğrulama, sonra commit/push.
- Kullanıcıyla iletişim Türkçe.

## Tamamlanmış özellikler (özet)

Auth + onboarding · Keşfet/swipe (filtreler kalıcı, kapı testi) · Testler
(uyum/eşleşme sistemi, oluşturma/etiketleme, sonuç karşılaştırma) ·
Mesajlaşma (polling, süper mesaj) · Bildirimler (genel + mesaj ayrı) ·
Gönderiler (feed, modal composer) · Profil (görüntüleme/düzenleme,
görüntüleyenler — ilk 3 ücretsiz) · Coin/puan sistemi + liderlik tablosu ·
Admin panel (kullanıcılar, test onayları, talepler) · PWA · SEO (sitemap,
JSON-LD, OG) · i18n (tr/en) · Mobil kabuk (BottomNav/Sidebar, `/menu` route).

Sayfa listesi (`apps/web/app/[locale]/`): `register`, `login`,
`forgot-password`, `reset-password`, `onboarding`, ve giriş yapmış kullanıcı
kabuğu altında (`(app)/`): `discover`, `tests` (+ `create`, `mine`, `history`,
`[id]`, `[id]/result`, `[id]/compare/[otherUserId]`), `messages` (+ `[chatId]`),
`likes`, `posts`, `profile` (+ `edit`, `viewers`), `notifications`, `coins`,
`leaderboard`, `menu`, `help`, `support`, `admin` (+ `users`, `tests`,
`requests`), ve herkese açık profil `u/[id]`.

## Mobil (apps/mobile, Expo) — planlanan, henüz yazılmadı

Öncelik **web'i bozmadan kusursuz bir mobil geçiş** — Vite'a olası bir
web geçişi şu an gündemde değil, ayrı bir gelecek kararı, mobil işini
etkilememeli.

- `packages/core` doğrudan reuse edilecek, sadece UI katmanı sıfırdan:
  swipe deck için `react-native-gesture-handler`/`reanimated`, Radix Dialog
  yerine bottom-sheet kütüphanesi, fotoğraf yükleme için Expo API'leri,
  Next.js routing yerine Expo Router/React Navigation.
- pnpm monorepo + Metro bundler için gerekenler: `.npmrc`'de
  `node-linker=hoisted` (ya da Metro'da `disableHierarchicalLookup`), ve
  `metro.config.js`'de `watchFolders` ile repo kökünü izlemek (böylece
  `packages/core` değişiklikleri Expo Go'da anında yansır).
- Test: Expo Go (QR okutup canlı cihazda), EAS Build (Mac gerekmeden
  yüklenebilir build), TestFlight/Play Store Internal Testing daha geniş beta
  için.
