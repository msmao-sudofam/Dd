-- "Try it on your product" before sign-up: an anonymous visitor's product photo (uploaded, or read from a store
-- page) and the one or two free ad stills made from it. Rows are reached only through the service role; the browser
-- holds a signed cookie with the id. Unclaimed sessions and their files are removed after 7 days by the app.
create table public.try_sessions (
  id               uuid primary key default gen_random_uuid(),
  ip_hash          text not null,                 -- salted hash, for rate limits only
  product_name     text not null default '',
  source_url       text,                          -- store page the photo was read from, if any
  upload_path      text not null,                 -- private uploads bucket: try/<id>/photo.<ext>
  consent_at       timestamptz not null default now(),
  look             text,                          -- last look asked for
  still_request_id text,
  still_provider   text,
  still_status     text not null default 'none' check (still_status in ('none', 'running', 'succeeded', 'failed')),
  still_path       text,                          -- private uploads bucket: try/<id>/still-<n>.jpg
  still_started_at timestamptz,
  stills_used      integer not null default 0,
  claimed_by       uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now()
);
create index try_sessions_ip_idx on public.try_sessions (ip_hash, created_at desc);
create index try_sessions_created_idx on public.try_sessions (created_at);

-- No policies: anon and authenticated roles cannot read or write this table.
alter table public.try_sessions enable row level security;
revoke all on public.try_sessions from anon, authenticated;
