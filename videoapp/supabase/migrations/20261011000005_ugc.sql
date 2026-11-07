-- UGC Ad Studio: AI creators, brand product projects, and multi-stage pipeline jobs.

-- A UGC ad is a `jobs` row with kind = 'ugc' that walks through stages
-- (voice → composite → avatar → broll → assemble). It reuses the ledger, refunds, library and margin.
alter table public.models drop constraint models_type_check;
alter table public.models add constraint models_type_check check (type in ('t2v', 'i2v', 't2i', 'i2i', 'ugc'));

alter table public.jobs
  add column kind       text not null default 'single' check (kind in ('single', 'ugc')),
  add column stage      text,
  add column stage_data jsonb not null default '{}'::jsonb;

-- AI creators. Library actors are fictional, AI-generated adults (owner_id null).
-- "Use my own face" actors belong to one user and require a logged consent.
create table public.ugc_actors (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  vibe              text not null default '',
  age_range         text not null default '25-34',
  setting           text not null default '',
  portrait_url      text,
  preview_video_url text,
  voice             text not null,          -- ElevenLabs voice name on fal
  voice_label       text not null default '',
  tags              text[] not null default '{}',
  owner_id          uuid references public.profiles(id) on delete cascade,
  upload_path       text,                   -- private uploads bucket path for own-face actors
  sort_order        integer not null default 100,
  enabled           boolean not null default true,
  created_at        timestamptz not null default now(),
  check (owner_id is null or upload_path is not null)
);

create table public.ugc_projects (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  product_name        text not null,
  product_description text not null default '',
  product_url         text,
  benefits            text[] not null default '{}',
  audience            text not null default '',
  offer               text not null default '',
  product_image_path  text,
  created_at          timestamptz not null default now()
);
create index ugc_projects_user_idx on public.ugc_projects (user_id, created_at desc);

alter table public.ugc_actors enable row level security;
alter table public.ugc_projects enable row level security;

create policy "ugc actors: library or own" on public.ugc_actors
  for select to authenticated using (enabled and (owner_id is null or owner_id = (select auth.uid())));
create policy "ugc actors: public library" on public.ugc_actors
  for select to anon using (enabled and owner_id is null);
create policy "ugc projects: read own" on public.ugc_projects
  for select to authenticated using (user_id = (select auth.uid()));

revoke insert, update, delete on public.ugc_actors, public.ugc_projects from anon, authenticated;
