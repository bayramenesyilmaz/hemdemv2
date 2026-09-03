# Hemdem v2

Kişilik testi + tanışma platformu — sıfırdan, temiz mimari ile yeniden
yazım. Detaylı teknik plan için [`PLAN.md`](./PLAN.md) dosyasına bakın
(fazlar, veri modeli, tasarım sistemi, SEO stratejisi).

## Teknoloji

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Supabase (Postgres,
Auth, Storage) + next-international (tr/en). Detaylar ve sürüm notları için
`PLAN.md` bölüm 2'ye bakın.

## Monorepo yapısı

```
hemdem-v2/
├── packages/
│   └── core/            # Framework'ten bağımsız domain + usecase + Supabase implementasyonları
├── apps/
│   └── web/              # Next.js (App Router) uygulaması
├── supabase/
│   └── migrations/       # SQL şema + RLS
```

`packages/core` React/Next.js/React Native import etmez — ileride yazılacak
Expo uygulaması aynı `usecases/*` ve `infrastructure/supabase/*` kodunu
doğrudan kullanır.

## Kurulum

```bash
pnpm install
cp apps/web/.env.local.example apps/web/.env.local   # değerleri doldur
pnpm dev
```

Supabase kurulumu için `supabase/README.md` dosyasına bakın.

## Ortam değişkenleri (env)

Tam liste `apps/web/.env.local.example` dosyasında. Vercel'de proje
oluşturulunca **Settings → Environment Variables**'a hepsi tek tek elle
eklenmeli — local'deki `.env.local` Vercel'e otomatik taşınmıyor.

| Değişken | Zorunlu mu | Ne işe yarıyor |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Evet (mock kapalıyken) | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Evet (mock kapalıyken) | Tarayıcıdaki Supabase client'ı için anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Evet (mock kapalıyken) | Server action'ların kullandığı service-role key — **asla** `NEXT_PUBLIC_` önekiyle veya tarayıcıya sızdırılmaz |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Hayır | `true` ise sahte in-memory veri kullanılır; `next.config.mjs` production build'de bunu her koşulda `false`'a sabitliyor (bkz. `CLAUDE.md`) |
| `NEXT_PUBLIC_DOMAIN` | Evet | Kanonik URL/SEO/paylaşım linkleri için taban domain |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Hayır | Google Search Console doğrulama meta etiketi |
| `CRON_SECRET` | **Evet (production'da)** | `vercel.json`'daki cron uçlarını (`/api/cron/leaderboard-rewards`, `/api/cron/daily-match`) yetkisiz çağrılara karşı korur — boş bırakılırsa bu uçlar kimlik doğrulamasız kalır |

## Durum

Web uygulaması (`apps/web`) üretimde ve aktif geliştiriliyor — auth, keşfet/
swipe, test/eşleşme sistemi, mesajlaşma, bildirimler, gönderiler, coin/puan
sistemi, admin panel, PWA ve SEO dahil. Sırada `apps/mobile` (Expo/React
Native) var. Güncel mimari özeti ve AI agent'lar için proje rehberi için
[`CLAUDE.md`](./CLAUDE.md) dosyasına bakın — `PLAN.md` tarihsel bir kayıt,
güncel tutulmuyor.
