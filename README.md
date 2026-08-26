# Hemdem v2

Kişilik testi + tanışma platformu — sıfırdan, temiz mimari ile yeniden
yazım. Detaylı teknik plan için proje sahibine iletilen plan dokümanına
bakın (fazlar, veri modeli, tasarım sistemi, SEO stratejisi).

## Monorepo yapısı

```
hemdem-v2/
├── packages/
│   └── core/            # Framework'ten bağımsız domain + usecase + Supabase implementasyonları
├── apps/
│   └── web/              # Next.js 14 (App Router) uygulaması
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

Faz 1-2 tamamlandı: monorepo iskeleti, domain/usecase/repository katmanları,
Supabase şeması + RLS, Next.js + Tailwind + next-international (tr/en)
temel kurulumu. Sıradaki fazlar için plan dokümanının 11. bölümüne bakın.
