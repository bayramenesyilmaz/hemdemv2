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
(uyum/eşleşme sistemi, oluşturma/etiketleme, sonuç karşılaştırma, +18/küfür
içerik filtresi) · Mesajlaşma (polling, süper mesaj, "Görüldü") ·
Bildirimler (genel + mesaj ayrı, `daily_match` dahil) · Gönderiler (feed,
modal composer) · Profil (görüntüleme/düzenleme, görüntüleyenler — ilk 3
ücretsiz, 3'e kadar fotoğraf galerisi, çevrimiçi durumu, doğrulama rozeti) ·
Boost (coin karşılığı keşfette öne çıkma) · Günün Eşleşmesi (cron ile günlük
kürate edilmiş öneri) · Engelleme/şikayet · Coin/puan sistemi + liderlik
tablosu · Admin panel (kullanıcılar, test onayları, doğrulama onayları,
talepler) · PWA · SEO (sitemap, JSON-LD, OG) · i18n (tr/en) · Mobil kabuk
(BottomNav/Sidebar, `/menu` route).

Sayfa listesi (`apps/web/app/[locale]/`): `register`, `login`,
`forgot-password`, `reset-password`, `onboarding`, ve giriş yapmış kullanıcı
kabuğu altında (`(app)/`): `discover`, `tests` (+ `create`, `mine`, `history`,
`[id]`, `[id]/result`, `[id]/compare/[otherUserId]`), `messages` (+ `[chatId]`),
`likes`, `posts`, `profile` (+ `edit`, `viewers`), `notifications`, `coins`,
`leaderboard`, `menu`, `help`, `support`, `admin` (+ `users`, `tests`,
`verifications`, `requests`), ve herkese açık profil `u/[id]`.

## Mobil (apps/mobile, Expo) — web ile büyük ölçüde feature-parity

Öncelik **web'i bozmadan kusursuz bir mobil geçiş** — Vite'a olası bir
web geçişi şu an gündemde değil, ayrı bir gelecek kararı, mobil işini
etkilememeli.

- Expo SDK 57 + Expo Router (`app/` dizini, dosya tabanlı routing).
  `packages/core` **hiç değiştirilmeden** doğrudan reuse ediliyor —
  `apps/mobile/lib/repositories.js` web'deki `apps/web/lib/repositories.js`
  ile birebir aynı composition-root deseni, sadece şimdilik sabit mock
  (henüz gerçek/mock anahtarı yok — `createMockRepositories()` doğrudan
  export ediliyor, env'e göre anahtarlama yok).
- Ekran kapsamı artık web'e yakın: `(tabs)/` altında `discover` (swipe
  destesi + günün eşleşmesi şeridi), `messages` (+ `[chatId]`, üçüncü sekme
  olarak "Profiline Bakanlar"), `notifications`, `coins`, `leaderboard`,
  `posts`, `privacy`, `menu`, `profile` (+ `edit` — 3 fotoğraf galerisi,
  boost, doğrulama kamerası —, `viewers`), `tests` (+ `create`, `mine`,
  `history`, `[id]`, `[id]/result`, `[id]/compare/[otherUserId]`), ve
  herkese açık profil `u/[id]`. Web'e göre eksik kalanlar: admin panel ve
  yardım/talep formları (mobilde henüz yok).
- **pnpm monorepo + Metro:** Beklenenin aksine `.npmrc`'de `node-linker=hoisted`
  gibi bir ayara gerek YOK — Expo SDK 57'nin `@expo/metro-config`'i pnpm'in
  symlink'li workspace yapısını ve `packages/core`'un `package.json`
  `exports` map'ini (`unstable_enablePackageExports`) zaten varsayılan
  olarak destekliyor; `pnpm why`/`expo export` ile doğrulandı. Tek gereken
  `apps/mobile/metro.config.js`'deki `watchFolders` (repo kökünü izler, böylece
  `packages/core`'daki bir değişiklik Expo Go'da anında yansır).
- `react-native-gesture-handler`/`react-native-reanimated`/`react-native-worklets`
  zaten kurulu (expo-router'ın kendisi bunlara peer olarak ihtiyaç duyuyor,
  swipe deck'ten bağımsız) — `babel-preset-expo` bunları otomatik algılayıp
  babel plugin'lerini ekliyor, `babel.config.js`'de elle bir şey eklemeye
  gerek yok.
- Mock seed'deki `avatarUrl` bir `data:image/svg+xml` URI'dir — React
  Native'in `Image`'ı bunu render edemez (SVG data URI desteklemiyor).
  `lib/avatar.js`'deki `isRenderableImageUri` bu durumu filtreler,
  render edilemeyen bir URI'de `components/InitialsAvatar.js` (düz
  View/Text ile baş harf rozeti) devreye giriyor. Gerçek fotoğraf
  yüklemesi (`expo-image-picker`, galeriden 3'e kadar profil fotoğrafı +
  doğrulama için zorunlu kamera çekimi) zaten eklendi — bu fallback artık
  sadece seed verisindeki SVG avatarlar için çalışıyor.
- Radix Dialog'un mobil karşılığı bottom-sheet bir kütüphane değil, React
  Native'in kendi `Modal`'ı (bkz. `profile/edit.js`, `discover.js` gibi
  ekranlardaki silme onayı/filtre/mesaj compose modalları) — bilinçli bir
  basitleştirme, eksik değil.
- **Önemli mimari not:** `apps/web`'de `SUPABASE_SERVICE_ROLE_KEY` sadece
  sunucu tarafında (server actions) kullanılıyor. Mobilde JS bundle'ı
  doğrudan cihazda çalıştığı için bu anahtar hiçbir şekilde mobil koda
  gömülemez — gerçek Supabase'e geçildiğinde mobil, web'deki gibi
  `packages/core/infrastructure/supabase/*`'i doğrudan çağıramaz, bunun
  yerine web'in server action'larına benzer bir API katmanı (route
  handler/Edge Function) üzerinden konuşması gerekecek.
- Test: Expo Go (QR okutup canlı cihazda — `pnpm --filter @hemdem/mobile start`),
  EAS Build (Mac gerekmeden yüklenebilir build), TestFlight/Play Store
  Internal Testing daha geniş beta için.
