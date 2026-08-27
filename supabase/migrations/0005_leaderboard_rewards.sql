-- Periyodik liderlik ödülleri: her puan kazanımı zaman damgasıyla loglanır
-- (günlük/3 günlük/haftalık pencerede toplam hesaplanabilsin diye) ve
-- hangi periyotların zaten ödüllendirildiği ayrı bir tabloda tutulur
-- (aynı periyoda iki kez ödül verilmesin diye — bkz.
-- grantPeriodicRewards usecase'i).

create table public.point_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  points bigint not null
);

create index point_events_user_id_created_at_idx
  on public.point_events (user_id, created_at);

create index point_events_created_at_idx
  on public.point_events (created_at);

create table public.leaderboard_reward_grants (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  period_type text not null check (period_type in ('daily', 'threeDay', 'weekly')),
  period_key text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rank smallint not null check (rank between 1 and 3),
  coins bigint not null,
  unique (period_type, period_key, user_id)
);

create index leaderboard_reward_grants_period_idx
  on public.leaderboard_reward_grants (period_type, period_key);

alter table public.point_events enable row level security;
alter table public.leaderboard_reward_grants enable row level security;
