-- Plan md 5.2'de profil özelliği olarak listelenen "sosyal medya
-- hesapları" alanı — platform adı serbest olduğu için (instagram,
-- twitter, tiktok vb.) sabit sütunlar yerine esnek bir jsonb kullanılıyor.
-- Şekil: { "instagram": "https://...", "twitter": "https://..." }

alter table public.profiles
  add column social_links jsonb not null default '{}'::jsonb;
