-- Dual-source CineVerse catalog: licensed commercial titles + public-domain/free-license titles.
-- This migration stores metadata and provider asset IDs, not movie files or provider secrets.
create extension if not exists pgcrypto;

create table if not exists public.catalog_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider_type text not null check (provider_type in ('licensed_api', 'public_domain', 'free_license', 'direct_license')),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused')),
  territory_codes text[] not null default array['BR']::text[],
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_movies (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.catalog_providers(id) on delete set null,
  provider_movie_id text,
  title text not null,
  original_title text,
  synopsis text not null default '',
  release_year integer check (release_year is null or release_year between 1888 and 2200),
  runtime_minutes integer check (runtime_minutes is null or runtime_minutes > 0),
  genres text[] not null default '{}'::text[],
  poster_url text,
  backdrop_url text,
  audio_languages text[] not null default '{}'::text[],
  subtitle_languages text[] not null default '{}'::text[],
  source_kind text not null check (source_kind in ('commercial_licensed', 'public_domain', 'free_license')),
  rights_status text not null default 'pending' check (rights_status in ('pending', 'verified', 'expired', 'revoked')),
  rights_evidence_url text,
  rights_valid_from date,
  rights_valid_until date,
  allowed_territories text[] not null default array['BR']::text[],
  playback_mode text not null default 'provider' check (playback_mode in ('provider', 'hls_signed', 'dash_signed')),
  provider_asset_id text,
  playback_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint catalog_movies_provider_id_unique unique (provider_id, provider_movie_id),
  constraint catalog_movies_playback_source check (
    playback_mode = 'provider' or playback_url is not null
  )
);

create index if not exists catalog_movies_published_idx
  on public.catalog_movies (is_published, rights_status, title);
create index if not exists catalog_movies_source_kind_idx
  on public.catalog_movies (source_kind);
create index if not exists catalog_movies_provider_idx
  on public.catalog_movies (provider_id);

alter table public.catalog_providers enable row level security;
alter table public.catalog_movies enable row level security;

drop policy if exists "view active catalog providers" on public.catalog_providers;
create policy "view active catalog providers"
  on public.catalog_providers for select to authenticated
  using (status = 'active');

drop policy if exists "view published verified movies" on public.catalog_movies;
create policy "view published verified movies"
  on public.catalog_movies for select to authenticated
  using (
    is_published = true
    and rights_status = 'verified'
    and (rights_valid_from is null or rights_valid_from <= current_date)
    and (rights_valid_until is null or rights_valid_until >= current_date)
    and exists (
      select 1
      from public.catalog_providers p
      where p.id = catalog_movies.provider_id
        and p.status = 'active'
    )
  );

-- No client insert/update/delete policies are intentionally created.
-- Importing metadata, verifying rights, and issuing playback URLs must be done server-side
-- after checking the authenticated admin role and subscription entitlement.
