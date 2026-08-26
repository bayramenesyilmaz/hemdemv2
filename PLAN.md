# Hemdem v2 — Sıfırdan Yeniden Yazım: Teknik Plan

> **Not (güncelleme):** Bu dosya, projeye ilk verilen teknik planın güncel
> tutulan halidir. İlk taslak eski bir projeye bakılarak hazırlandığı için
> bağımlılık versiyonları geride kalmıştı; bu revizyonda **teknoloji
> kararları tablosu ve ilgili implementasyon notları** en güncel kararlı
> sürümlere göre güncellendi. Mimari/özellik kararları (bölüm 3-11)
> değişmedi. Versiyonlar yazıldığı tarihte (bkz. güncelleme notu sonundaki
> tarih) en güncel kararlı sürümlerdir — yeni bir oturumda tekrar
> `npm view <paket> version` ile kontrol edilmesi önerilir, zira bu
> ekosistemde sürümler hızlı ilerliyor.

Bu doküman, mevcut Hemdem projesinin (kişilik testi + tanışma platformu)
tüm iş mantığını temel alarak, **sıfırdan, temiz mimari ile** yeniden
kodlanması için hazırlanmıştır. Yeni bir proje/oturumda bu dosya
doğrudan başlangıç talimatı olarak kullanılabilir.

---

## 1. Amaç

Mevcut Hemdem, tek kişi tarafından zamanla üst üste eklenerek büyütülmüş
bir Next.js/Supabase projesi. Bu birikim iki soruna yol açtı: (a)
Supabase erişimi server action'lardan bile hep `anon key` ile
yapılıyor, yetkilendirme tamamen uygulama koduna güveniyor, RLS
kullanılmıyor; (b) UI bileşenleri ve sayfa yapıları defalarca üst üste
yamanmış, tutarsız bir tasarım dili oluşmuş. Bu proje, **aynı ürün
mantığını** (kişilik testleri + swipe tabanlı tanışma + sosyal
özellikler) koruyarak, baştan temiz bir mimari ile yeniden kurmayı
hedefliyor. İkinci hedef: **ileride React Native ile yazılacak mobil
uygulamanın** iş mantığını (repository/use-case katmanı) doğrudan
paylaşabilmesi için bugünden doğru katmanlanma.

## 2. Teknoloji Kararları

| Konu | Karar | Gerekçe |
|---|---|---|
| Web framework | **Next.js 16 (App Router)** | SEO en kritik gereksinim; Next.js'in `generateMetadata`, sunucu bileşenleri, `sitemap.xml`/`robots.txt` route'ları, ISR/SSG desteği Vite+SPA'ya göre SEO'da doğrudan üstün. Vite saf SPA'da client-render varsayılan olduğundan arama motoru indekslemesi için ekstra prerender katmanı gerekir — gereksiz karmaşıklık. |
| Veritabanı | **Supabase (Postgres)** | Uygulamanın veri modeli tamamen ilişkisel (many-to-many swipe/match, benzersizlik kısıtları, join'li liderlik tablosu, puan hesapları). Firestore (Firebase) NoSQL olduğu için bu ilişkileri ve `unique(from_user,to_user)` gibi kısıtları veritabanı seviyesinde ifade edemez, mantık istemci/sunucu koduna kayar. Supabase ayrıca gerçek zamanlı (Realtime) sohbet için zaten kanıtlanmış, ücretsiz planında 1 GB Storage var (avatar/gönderi görseli için yeterli başlangıç). |
| Kimlik doğrulama | **Supabase Auth** | Veritabanıyla bütünleşik, e-posta/şifre + ileride OAuth (Google) eklenebilir. |
| Stil / UI kit | **Tailwind CSS v4 + kendi sahip olduğumuz Radix tabanlı bileşen kiti** (shadcn/ui yöntemiyle: `npx shadcn` ile üretilip repo içine kopyalanan, tamamen düzenlenebilir JSX bileşenler) | Hazır bir "kapalı kutu" kütüphaneye bağımlı kalınmaz, her bileşenin kaynağı elimizde olur — "istersen kendin yaz" isteğine tam karşılık gelir ama sıfırdan erişilebilirlik (Dialog, Select, Tabs, Checkbox vb. klavye/ekran okuyucu desteği) yeniden icat edilmez. Tailwind'in utility-first yaklaşımı, ileride React Native tarafında **NativeWind** ile aynı tasarım dilini (renk paleti, spacing ölçeği) paylaşmaya izin verir. Tailwind v4 ile config artık CSS içinde (`@theme`) tanımlanıyor, ayrı bir `tailwind.config.js` gerekmiyor. |
| Dil kodu | **Saf JavaScript/JSX — TypeScript YOK** | Açık istek. `.js`/`.jsx` uzantıları, JSDoc ile tip ipucu (isteğe bağlı, derleme zorunluluğu yok). |
| Çoklu dil | **next-international, sadece `tr` ve `en`** | Mevcut projede kanıtlanmış kütüphane, hafif ve App Router ile sorunsuz çalışıyor (proxy.js + `createI18nMiddleware`, App Router'ın resmi i18n rehberiyle birebir aynı desen). 13 dil yerine 2 dil = çeviri bakım yükü büyük ölçüde azalır, SEO içeriği her iki dilde de tam kalitede tutulabilir. |
| Mobil (ileride) | **React Native (Expo) + aynı domain/use-case katmanı** | Aşağıdaki "Repository Pattern" mimarisi sayesinde iş mantığı kod tekrarı olmadan mobilde yeniden kullanılabilir. |

### Sürüm notu (implementasyon detayı, mimariyi etkilemez)

Proje şu an şu sürümlerle kuruludur — bir sonraki oturumda `npm view
<paket> version` ile tekrar kontrol edip gerekirse yükseltin:

- `next` 16.x, `react`/`react-dom` 19.x
- `tailwindcss` 4.x + `@tailwindcss/postcss` 4.x (config-free, CSS-first `@theme`)
- `next-international` 1.3.x
- `@supabase/supabase-js` 2.x, `@supabase/ssr` 0.12.x

**Next.js 15+/16 ile gelen ve kod yazarken akılda tutulması gereken
kırılma değişiklikleri:**

- `params` ve `searchParams` artık **Promise** — her yerde
  `const { locale } = await params;` gibi await'lenmeli (server
  component'lerde ve `generateMetadata`'da).
- `cookies()` ve `headers()` (`next/headers`) artık **async** —
  `const cookieStore = await cookies();`.
- `middleware.js` dosya kuralı deprecated, yerine **`proxy.js`** kullanılıyor
  (aynı `config.matcher` export'u, fonksiyon adı `middleware` yerine `proxy`).
- **Cache Components** (`cacheComponents: true` config bayrağı) Next 16 ile
  gelen yeni, opt-in önbellekleme modeli (`"use cache"` direktifi +
  Partial Prerendering). Yeni projelerde **varsayılan olarak kapalı**.
  Bu proje bilinçli olarak **etkinleştirmiyor**: uygulamanın çoğu sayfası
  (keşfet, sohbet, profil, bildirimler) oturuma bağlı/kişiselleştirilmiş
  olduğundan statik önbellekten faydalanmayacak, buna karşın her veri
  erişimini `"use cache"`/`<Suspense>` ile işaretleme yükü tüm fazlara
  yayılırdı. Yalnızca gerçekten statik/herkese açık sayfalar (karşılama,
  yardım merkezi) için ileride noktasal olarak değerlendirilebilir.
- ESLint artık **flat config** (`eslint.config.mjs`), `next lint` komutu
  kaldırıldı — `package.json`'da `"lint": "eslint"` kullanılıyor.

### Neden monorepo?

İleride React Native yazılacağı bilindiği için, proje **baştan bir
monorepo** olarak kurulmalı (npm/pnpm workspaces):

```
hemdem-v2/
├── packages/
│   └── core/              # Framework'ten bağımsız iş mantığı (aşağıda detay)
├── apps/
│   └── web/                # Next.js uygulaması (bu plan kapsamında yazılacak)
│   └── mobile/              # (ileride) Expo/React Native — core'u aynen kullanır
├── package.json            # workspaces tanımı
└── pnpm-workspace.yaml
```

Bu sayede mobil uygulama yazılırken `packages/core` içindeki tüm
repository/use-case kodu **hiç değiştirilmeden** import edilir; sadece
UI katmanı (React Native bileşenleri) yeniden yazılır.

---

## 3. Mimari — Repository Pattern (katmanlar)

```
packages/core/
├── domain/
│   ├── entities/          # Düz JS obje şekilleri + doğrulama fonksiyonları
│   │   ├── user.js
│   │   ├── test.js
│   │   ├── swipe.js
│   │   └── ...
│   └── repositories/       # SADECE arayüz/sözleşme (JSDoc ile), implementasyon YOK
│       ├── userRepository.js       # @typedef ile hangi metotlar bekleniyor
│       ├── testRepository.js
│       ├── swipeRepository.js
│       ├── chatRepository.js
│       ├── postRepository.js
│       └── ...
├── usecases/               # İş kuralları — repository interface'lerini kullanır,
│   │                         Supabase'i hiç bilmez, framework'ten bağımsızdır
│   ├── auth/
│   │   ├── registerUser.js
│   │   └── loginUser.js
│   ├── discover/
│   │   ├── fetchDiscoverCandidates.js
│   │   ├── likeUser.js            # kapı testi kontrolü, eşleşme mantığı burada
│   │   └── guestRegisterAndLike.js
│   ├── tests/
│   │   ├── createTest.js
│   │   ├── submitAnswers.js
│   │   └── calculateSimilarity.js
│   ├── chat/
│   │   └── sendMessage.js
│   ├── posts/
│   │   └── createPost.js
│   └── coins/
│       └── grantAdWatchReward.js
└── infrastructure/
    └── supabase/            # Repository interface'lerinin GERÇEK implementasyonu
        ├── supabaseClient.js        # server-only, service-role key
        ├── supabaseUserRepository.js
        ├── supabaseTestRepository.js
        ├── supabaseSwipeRepository.js
        └── ...
```

**Kural:** `usecases/` klasöründeki hiçbir dosya `@supabase/supabase-js`
import etmez. Sadece `domain/repositories/*` üzerinden soyut metot
çağırır (`userRepository.findById(id)` gibi). Hangi implementasyonun
kullanılacağı, uygulamanın en dışında (composition root) bağlanır:

```js
// packages/core/infrastructure/container.js
import { supabaseUserRepository } from "./supabase/supabaseUserRepository";
import { supabaseSwipeRepository } from "./supabase/supabaseSwipeRepository";
// ...

export const repositories = {
  user: supabaseUserRepository,
  swipe: supabaseSwipeRepository,
  // ...
};
```

`apps/web` (Next.js Server Actions / Route Handlers) bu `repositories`
nesnesini import edip use-case'lere enjekte eder. `apps/mobile` ileride
**aynı `container.js`'i aynen kullanır** — Supabase JS SDK React
Native'de de çalışır, tek fark UI katmanıdır.

### Neden bu katmanlama önemli?

- **Test edilebilirlik**: `usecases/` saf fonksiyonlar olduğu için
  sahte (mock) repository ile birim testi yazmak kolaydır.
- **Değişime dayanıklılık**: Yarın Supabase'den vazgeçilirse sadece
  `infrastructure/supabase/*` değişir, iş mantığı hiç dokunulmaz.
- **Mobil paylaşımı**: React Native yazılacağı gün, iş mantığının
  %90'ı hazır olur.

### Next.js tarafında kullanım deseni

```js
// apps/web/lib/actions/swipeActions.js
"use server";
import { likeUser } from "@hemdem/core/usecases/discover/likeUser";
import { repositories } from "@hemdem/core/infrastructure/container";
import { getAuthUserId } from "@/lib/session"; // Next.js'e özel, sadece cookie okur

export async function likeUserAction(targetUserId) {
  const userId = await getAuthUserId();
  return likeUser(repositories, userId, targetUserId);
}
```

Sunucu bileşenleri/Server Actions **her zaman** `service role` anahtarı
kullanan Supabase client'ı ile çalışır (tarayıcıya hiçbir Supabase
anahtarı gönderilmez — mevcut projedeki "anon key her yerde" sorunu
kökten çözülür). Yetkilendirme (bu kaydı sadece sahibi silebilir vb.)
`usecases/` katmanında, açıkça kod olarak yazılır — okunabilir ve test
edilebilir.

### RLS stratejisi (bu sefer doğru kurulacak)

- Tüm tablolarda RLS **açık**.
- Politika: **varsayılan reddet** (hiç policy yoksa zaten böyle).
- Çünkü tüm yazma/okuma sunucu tarafından `service role` ile yapılıyor,
  RLS bu key için zaten by-pass edilir — asıl amaç, birinin yanlışlıkla
  tarayıcıdan `anon key` ile doğrudan Supabase'e istek atmasını
  (mevcut projede olduğu gibi) **imkansız** kılmak. Bu, savunma
  katmanı olarak RLS'i doğru kullanmak demektir.
- `auth.users` ↔ `public.profiles` ilişkisi **1:1**, `profiles.id`
  `auth.users.id`'ye `references ... on delete cascade` ile bağlı
  (mevcut projede email eşleştirmesiyle yapılan kırılgan yöntem yerine).

---

## 4. Veritabanı Şeması (Supabase/Postgres)

Mevcut Hemdem'in doğrulanmış şeması temel alınarak temizlenmiş hâli:

```sql
-- profiles: auth.users ile 1:1
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  name text,
  avatar_url text,
  bio text,
  gender text check (gender in ('male','female')),
  country text,
  interested_in text check (interested_in in ('male','female','both')),
  birthdate date,
  language text not null default 'tr',
  role text not null default 'user' check (role in ('user','admin')),
  is_banned boolean not null default false,
  gate_test_id uuid references public.tests(id),
  gate_test_threshold smallint check (gate_test_threshold between 0 and 100),
  allow_guest_likes boolean not null default false
);

create table public.tests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  category_id smallint not null,
  language text not null default 'tr',
  questions jsonb not null,       -- [{ id, text, options: [{id, text}] }]
  point bigint not null default 0,
  approved boolean not null default true,
  is_deleted boolean not null default false
);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  test_id uuid not null references public.tests(id) on delete cascade,
  user_answers jsonb not null,    -- [{ questionId, choiceId }]
  unique (user_id, test_id)
);

create table public.swipes (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('like','dislike','superlike')),
  unique (from_user, to_user)
);

create table public.matches (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  check (user_a < user_b),
  unique (user_a, user_b)
);

create table public.chats (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('match','super_message')),
  check (user_a < user_b),
  unique (user_a, user_b)
);

create table public.messages (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  chat_id bigint not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null
);

create table public.posts (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 500),
  tagged_test_id uuid references public.tests(id) on delete set null
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null
);

create table public.profile_views (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  viewed_id uuid not null references public.profiles(id) on delete cascade,
  unique (viewer_id, viewed_id)
);

create table public.user_coins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  coin bigint not null default 0
);

create table public.user_points (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  point bigint not null default 0
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('complaint','request')),
  subject text not null,
  description text not null,
  email text
);
```

**Mevcut projeden farklar (bilinçli iyileştirmeler):**
- `users` → `profiles`, `auth.users`'a doğrudan FK (email eşleştirmesi
  yok).
- `user_coins`/`user_points` artık `userId` başına ayrı satır yerine
  `user_id` **primary key** — birebir ilişki, gereksiz `id`/tekilleştirme
  sorgusu yok.
- Sütun adları tamamen `snake_case` (mevcut projede `isDelete`,
  `userId` gibi karışık case vardı).
- Otomatik sohbet temizliği: `pg_cron` ile haftada bir, 1 haftadır
  `last_message_at` güncellenmeyen `chats` satırlarını (ve cascade ile
  `messages`'ı) silen zamanlanmış görev — mevcut projedeki mantığın
  aynısı.

---

## 5. Özellik Spesifikasyonu

Mevcut Hemdem'de çalışan tüm özellikler korunacak:

1. **Kimlik doğrulama**: kayıt (e-posta/şifre), giriş, şifremi
   unuttum, ilk-giriş profil tamamlama, hesap silme.
2. **Profil**: ad, fotoğraf (Supabase Storage), bio, cinsiyet, ülke,
   ilgi tercihi, doğum tarihi (yaş hesaplama), dil, sosyal medya
   hesapları, kapı testi (gate test) seçimi + eşik yüzdesi, misafir
   beğenilerine açıklık ayarı.
3. **Testler**: kategori bazlı test listesi, filtre (kategori + dil +
   arama, tek modal içinde), test çözme, sonuç sayfası (benzerlik
   yüzdesi hesaplama), kendi test oluşturma (300 coin karşılığı),
   testlerim / geçmiş testlerim, liderlik tablosu (puan bazlı), test
   paylaşma/şikayet modalları.
4. **Keşfet (Swipe)**: kart destesi (fotoğraf + isim + yaş + ülke + bio
   + kapı testi bilgisi), sürükle-bırak beğen/geç, sabit (fixed)
   aksiyon çubuğu, karta dokununca profil detayına gitme, filtre modalı
   (cinsiyet/ülke/yaş aralığı), **misafir modu**: hesap olmadan kartları
   gezme, `allow_guest_likes=true` olan profillere hızlı-kayıt-ile-
   beğeni gönderme akışı.
5. **Kapı testi mantığı**: bir kullanıcıya gelen beğeni, o kullanıcının
   seçtiği testi göndericinin daha önce çözmüş olmasını ve benzerlik
   yüzdesinin eşik değerini geçmesini şart koşabilir.
6. **Eşleşme & Mesajlaşma**: karşılıklı beğenide otomatik eşleşme +
   sohbet açılması, coin karşılığı "süper mesaj" (eşleşme olmadan
   direkt mesaj hakkı), gerçek zamanlı sohbet (Supabase Realtime), 1
   hafta hareketsizlikte otomatik silme.
7. **Gelen beğeniler**: kabul/reddet, kabul edilince eşleşme.
8. **Gönderiler (Feed)**: metin paylaşımı + isteğe bağlı kendi/başka
   bir testi etiketleme, akış listesi, kendi gönderisini silme,
   misafirler okuyabilir, paylaşmak için üye olma gerekir.
9. **Notlar**: kullanıcıya özel, kişisel not defteri (CRUD).
10. **Profilimi Kim Görüntüledi**: görüntülenme sayısı herkese açık,
    kimlerin baktığı coin karşılığı açılıyor.
11. **Coin ekonomisi**: reklam izleyerek coin kazanma (süre bazlı, 6
    kademe, en yüksek kademe "en avantajlı" olarak öne çıkar), coin
    harcama noktaları (süper mesaj, test oluşturma, profil
    görüntüleyenleri açma).
12. **Talep/Şikayet formu**.
13. **Admin panel**: kullanıcı yönetimi (ban/unban), test onaylama,
    talep listesi görüntüleme.
14. **Blog/Yardım merkezi**: SSS ve iletişim formu (basit statik
    içerik, CMS yok).

**Kapsam dışı bırakılanlar** (mevcut projede vardı, bu sefer
alınmıyor): Gemini/AI destekli test üretimi, AI karakter analizi —
kullanıcı bu özellikleri zaten kaldırmıştı.

---

## 6. Navigasyon ve Sayfa Haritası

Bu oturumda mevcut projede geldiğimiz nihai navigasyon yapısı
doğrudan taşınacak:

- **`/` (`/[locale]`)**: Herkese açık karşılama/tanıtım sayfası (SEO
  odaklı, misafir CTA'ları: Kayıt Ol / Giriş Yap).
- **Alt navigasyon (uygulama içi, `lg:hidden`)**: Keşfet, Testler,
  Gönderiler, Mesajlar (aktif sekme vurgusu).
- **Sağ üst tam ekran menü**: Profil, Beğenenler, Profil
  Görüntüleyenleri, Notlar, Coin Kazan, Testlerim, Geçmiş Testlerim,
  Talep, Ayarlar (dil/tema).
- **Masaüstü**: sol sabit sidebar, aynı linkler.
- Giriş yapan kullanıcı `/` yerine doğrudan `/discover`'a yönlenir.
- Sayfa başlıkları (`<h1>`) sadece gerçekten gerekli olduğu yerlerde
  (profil, herkese açık profil sayfası) var; diğer iç sayfalarda
  navigasyon zaten bağlamı verdiği için ayrı başlık bloğu yok — sadece
  gerekli aksiyon butonları (Filtrele, Oluştur) üstte sağda.

## 7. Tasarım Sistemi

- **Renk paleti**: kırmızı-siyah marka kimliği (`--primary: hsl(350 82%
  52%)` gibi HSL tabanlı CSS custom property'ler, açık/koyu tema).
  Tailwind v4 ile bu token'lar `app/globals.css` içinde `@theme inline`
  bloğuyla utility class'lara (`bg-primary`, `text-foreground` vb.)
  bağlanır — ayrı bir `tailwind.config.js` yok.
- **Bileşen kiti**: Button (varyantlar: add/confirm/delete/edit/send/
  outline/ghost/link), Dialog, DropdownMenu, Select, Tabs, Checkbox,
  Input, Textarea, Avatar — hepsi `components/ui/` altında, shadcn
  yöntemiyle üretilip elle düzenlenmiş.
- **Paylaşılan üst düzey bileşenler**: `PageTitle` (sade, sadece
  gerekli yerlerde), `SectionCard` (tutarlı kart yüzeyi), `EmptyState`
  (boş liste durumları), `InfoBanner` (bilgilendirme, kırmızı/hata
  rengiyle karıştırılmayacak nötr bir stil).
- **Animasyon**: framer-motion; liste öğelerinde sadece opacity fade
  (kayma hissi yaratan y-offset kullanılmayacak — bu oturumda tam da bu
  yüzden kartlarda "kayma" şikayeti almıştık), sayfa geçişlerinde hafif
  fade.
- **Mobil öncelik**: tüm sayfalar önce mobilde, sonra `lg:` ile
  masaüstünde tasarlanacak.

## 8. SEO Stratejisi

- Her route için `generateMetadata` (title/description/keywords/OG/
  Twitter card), `tr` ve `en` için `hreflang` alternates.
- `sitemap.xml` ve `robots.txt` route handler'ları (mevcut projedeki
  gibi, sadece 2 dil için).
- Genel karşılama sayfası ve testler listesi **sunucu bileşeni**
  olarak render edilecek (crawler'lar için tam içerik, client-only
  render yok).
- JSON-LD structured data: `WebSite`, `Organization`, uygun olan
  sayfalarda `Quiz`/`FAQPage`.
- `next/image` ile görsel optimizasyonu, `next/font` ile font
  optimizasyonu (Core Web Vitals).
- Kanonik URL'ler, tekrarlayan/parametre bazlı sayfalarda (`?category=`
  gibi) `noindex` gerekmiyorsa canonical'a dikkat.

## 9. Kod Standartları

- **Sadece `.js`/`.jsx`**, TypeScript yok. Karmaşık obje şekilleri için
  JSDoc `@typedef` yorumları (editör otokompleti için, derleme
  zorunluluğu yok).
- **Dosya adlandırma**: `kebab-case.js` (bileşenler için de), fonksiyon/
  değişken `camelCase`, bileşen adı `PascalCase`.
- **Server Actions**: hata durumunda asla `throw` ile ham obje
  fırlatma (Next.js production'da mesajı gizler) — her zaman
  `{ status: "error", message }` döndür.
- **Yorum kuralı**: sadece "neden" açıklaması gereken karmaşık/şaşırtıcı
  yerlerde tek satır yorum; "ne yaptığını" anlatan yorum yazılmaz
  (değişken/fonksiyon adları zaten açık olmalı).
- **Tekrar etmeyen kod**: 3+ yerde tekrar eden UI parçası paylaşılan
  bileşene çıkarılır (bu oturumda `AuthRequiredNotice`, `EmptyState`,
  `InfoBanner`, `SectionCard` böyle doğdu — v2'de bunlar baştan var
  olacak).
- **Guest/anonim erişim** her use-case'te açıkça ele alınacak (mevcut
  projede sonradan yama olarak eklendiği için birkaç sayfa misafiri
  unutmuştu — v2'de her sayfa tasarımında "giriş yapmamış kullanıcı ne
  görür?" sorusu baştan cevaplanacak).
- **Next.js 15+/16 async API'leri**: `params`, `searchParams`,
  `cookies()`, `headers()` her zaman `await`'lenir (bkz. bölüm 2 sürüm
  notu) — bu, "unutulması en kolay" hata kaynağı olduğu için build
  sırasında hemen fark edilir (Next derleme zamanında hata verir).

## 10. Mobil (React Native) için Hazırlık

- `packages/core` hiçbir React/Next.js/React Native import'u
  içermeyecek (saf JS) — sadece `usecases/` ve `domain/` katmanı.
- `infrastructure/supabase/*` Node.js ve React Native'de aynı şekilde
  çalışan `@supabase/supabase-js` kullandığı için değişiklik gerekmez.
- İleride Expo projesi açıldığında: `apps/mobile` sadece ekranları
  (React Native bileşenleri) yazar, `packages/core/usecases/*`'ı
  doğrudan import eder. NativeWind ile web'deki Tailwind sınıflarının
  büyük kısmı (renk/spacing) kavramsal olarak taşınabilir.
- Push bildirim, deep-link gibi mobil özel konular o aşamada ayrıca
  planlanacak (bu doküman kapsamı dışı).

## 11. Uygulama Yol Haritası (Fazlar)

Yeni oturumda bu sırayla ilerlenmesi önerilir (her faz sonunda
lint+build doğrulaması ve commit):

1. Monorepo iskeleti + `packages/core` boş katmanlar + Next.js app
   kurulumu (Tailwind, next-international tr/en, temel layout). ✅ Tamamlandı.
2. Supabase şeması (yukarıdaki SQL) + RLS + `packages/core/
   infrastructure/supabase` repository implementasyonları. ✅ Tamamlandı.
3. Kimlik doğrulama akışı (kayıt/giriş/ilk-giriş/şifre sıfırlama) +
   `profiles` oluşturma.
4. Profil görüntüleme/düzenleme + tasarım sistemi temel bileşenleri
   (Button, Dialog, Select, SectionCard, EmptyState, InfoBanner,
   PageTitle).
5. Testler modülü (liste, filtre modalı, oluşturma, çözme, sonuç,
   liderlik tablosu).
6. Keşfet/Swipe modülü (kart, filtre modalı, misafir modu, kapı testi
   mantığı).
7. Eşleşme + Sohbet (realtime, süper mesaj, otomatik silme cron'u).
8. Gönderiler/Feed + Notlar.
9. Profil Görüntüleyenleri + Coin ekonomisi (reklam izleme akışı).
10. Talep/Şikayet + Admin panel + Blog/Yardım merkezi.
11. SEO son rötuş (sitemap, robots, JSON-LD, OG görselleri) + genel
    performans/erişilebilirlik denetimi.

## 12. Ortam Değişkenleri / Kurulum Checklist

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # sadece client-side auth (login/register) için
SUPABASE_SERVICE_ROLE_KEY=            # ASLA NEXT_PUBLIC_ önekiyle değil — server-only
NEXT_PUBLIC_DOMAIN=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION= # (opsiyonel)
```

- Supabase projesi oluştur → yukarıdaki SQL'i çalıştır → Storage'da
  `avatars` bucket'ı aç (1 GB ücretsiz kotayı unutma, görsel boyutunu
  sınırla/optimize et).
- `pg_cron` extension'ını aç, haftalık sohbet temizliği job'ını kur.
- Vercel'e deploy, ortam değişkenlerini gir, `NEXT_PUBLIC_DOMAIN`'i
  gerçek alan adıyla güncelle.

---

**Bu dosyayı yeni oturuma gönderdiğinde**, oturum önce 1-2. fazları
(iskelet + şema) kurup sana ara rapor vermeli, sonra sırayla ilerlemeli
— tıpkı bu projede izlediğimiz "her faz kendi commit'i" yöntemi gibi.
