-- Phase 2: storage buckets, moderation + consent logs.

-- Outputs are public (unguessable uuid paths) so they can be embedded/downloaded directly.
-- Uploads (user photos, possibly faces) are private; providers get a short-lived signed URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('outputs', 'outputs', true, 524288000, array['video/mp4', 'image/png', 'image/jpeg', 'image/webp']),
  ('uploads', 'uploads', false, 15728640, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;
-- All storage writes happen server-side with the secret key; no client policies needed.

-- Every blocked prompt/upload, for abuse review.
create table public.moderation_events (
  id         bigserial primary key,
  user_id    uuid references public.profiles(id) on delete set null,
  kind       text not null check (kind in ('text', 'image')),
  excerpt    text not null default '',
  reasons    text[] not null default '{}',
  source     text not null default 'local' check (source in ('local', 'openai')),
  created_at timestamptz not null default now()
);
create index moderation_events_user_idx on public.moderation_events (user_id, created_at desc);

-- "This is me or I have consent" checkbox, logged per upload (BUILD_PLAN §7).
create table public.consent_log (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  upload_path text not null,
  statement   text not null,
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index consent_log_user_idx on public.consent_log (user_id, created_at desc);

alter table public.moderation_events enable row level security;
alter table public.consent_log enable row level security;
revoke all on public.moderation_events, public.consent_log from anon, authenticated;
