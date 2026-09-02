-- Etkileşim/güven özellikleri turu: çevrimiçi durumu, çoklu profil
-- fotoğrafı, Boost, mesaj görüldü bilgisi, profil doğrulama, Günün
-- Eşleşmesi. Diğer tüm tablolarla aynı strateji: RLS açık, policy yok
-- (varsayılan reddet), uygulama her zaman service role ile sunucu
-- tarafından yazar.

-- Çevrimiçi durumu — "çevrimiçi" olup olmadığı sabit bir eşikle
-- (now() - last_seen_at < 3 dk) türetilir, ayrı bir boolean kolon gerekmez.
alter table public.profiles add column last_seen_at timestamptz;

-- Fotoğraf galerisi (3'e kadar). avatar_url bilinçli olarak kaldırılmıyor
-- ve photos[0] ile senkron tutulacak — chat/discover/bildirim/tab bar gibi
-- onlarca yer hâlâ avatar_url okuyor, bunların hepsini değiştirmek yerine
-- tek bir alanı ("ilk fotoğraf") aynalamak çok daha düşük riskli.
alter table public.profiles add column photos text[] not null default '{}';
update public.profiles set photos = array[avatar_url] where avatar_url is not null;

-- Boost: coin karşılığı, sınırlı süre keşfette öne çıkma.
alter table public.profiles add column boosted_until timestamptz;

-- Profil doğrulama. Test onayı ("approved"+"is_deleted" boolean çifti)
-- buradaki ihtiyaca uymuyor — reddedilen bir doğrulama, testin aksine,
-- kullanıcı tarafından tekrar gönderilebilmeli, bu yüzden bilinçli olarak
-- tri-state bir status kolonu kullanılıyor.
alter table public.profiles add column verification_photo_url text;
alter table public.profiles add column verification_status text not null default 'none'
  check (verification_status in ('none', 'pending', 'approved', 'rejected'));

-- Mesajlarda "Görüldü": mesaj başına değil sohbet+kullanıcı başına "son
-- okunan zaman" — her yeni mesajda tüm geçmiş satırları güncellemek yerine
-- tek bir satır upsert edilir.
create table public.chat_reads (
  chat_id bigint not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);

alter table public.chat_reads enable row level security;

-- Günün Eşleşmesi: kullanıcı başına tek satır (user_coins ile aynı desen),
-- her gün cron ile üzerine yazılır.
create table public.daily_matches (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  matched_user_id uuid references public.profiles(id) on delete set null,
  matched_date date not null,
  created_at timestamptz not null default now()
);

alter table public.daily_matches enable row level security;

-- Günün Eşleşmesi bildirimi için yeni tip.
alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('test_similarity', 'incoming_like', 'match', 'message', 'daily_match'));
