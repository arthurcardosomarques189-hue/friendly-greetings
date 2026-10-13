-- Require a valid CineVerse subscription before a member can read the streaming catalog.
-- Playback endpoints must repeat these checks server-side; RLS alone is not a playback-token system.

drop policy if exists "view published verified movies" on public.catalog_movies;
create policy "active subscribers view published verified movies"
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
        and p.territory_codes @> array['BR']::text[]
    )
    and exists (
      select 1
      from public.subscriptions s
      where s.user_id = auth.uid()
        and s.blocked = false
        and s.expires_at > now()
    )
  );

-- Catalog providers should only be visible when active in Brazil.
drop policy if exists "view active catalog providers" on public.catalog_providers;
create policy "view active catalog providers"
  on public.catalog_providers for select to authenticated
  using (
    status = 'active'
    and territory_codes @> array['BR']::text[]
    and exists (
      select 1
      from public.subscriptions s
      where s.user_id = auth.uid()
        and s.blocked = false
        and s.expires_at > now()
    )
  );
