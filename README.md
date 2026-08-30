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

## Durum

Web uygulaması (`apps/web`) üretimde ve aktif geliştiriliyor — auth, keşfet/
swipe, test/eşleşme sistemi, mesajlaşma, bildirimler, gönderiler, coin/puan
sistemi, admin panel, PWA ve SEO dahil. Sırada `apps/mobile` (Expo/React
Native) var. Güncel mimari özeti ve AI agent'lar için proje rehberi için
[`CLAUDE.md`](./CLAUDE.md) dosyasına bakın — `PLAN.md` tarihsel bir kayıt,
güncel tutulmuyor.
