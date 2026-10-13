-- CineVerse subscription and admin data safeguards.
-- Apply with Supabase SQL Editor or the project's migration workflow.
create extension if not exists pgcrypto;

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  blocked boolean not null default false,
  expires_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_cents integer not null default 5000 check (amount_cents = 5000),
  confirmed_at timestamptz not null default now(),
  confirmed_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  reference text not null,
  constraint payments_reference_nonempty check (length(trim(reference)) > 0),
  constraint payments_unique_reference_per_user unique (user_id, reference)
);

create table if not exists public.payment_settings (
  id integer primary key default 1 check (id = 1),
  pix_key text not null default '',
  recipient text not null default '',
  contact text not null default ''
);

create table if not exists public.movie_sources (
  movie_id integer primary key check (movie_id > 0),
  title text not null,
  playback_url text not null check (playback_url like 'https://%'),
  rights_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.payment_settings enable row level security;
alter table public.movie_sources enable row level security;

-- Read-only access is limited to each member's own records. Admin writes are
-- performed by the server using the service role after checking user_roles.
drop policy if exists "members read own subscription" on public.subscriptions;
create policy "members read own subscription" on public.subscriptions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "members read own payments" on public.payments;
create policy "members read own payments" on public.payments
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "members read payment settings" on public.payment_settings;
create policy "members read payment settings" on public.payment_settings
  for select to authenticated using (true);

drop policy if exists "members read authorized video sources" on public.movie_sources;
create policy "members read authorized video sources" on public.movie_sources
  for select to authenticated using (rights_confirmed = true);

create or replace function public.confirm_monthly_payment(
  target uuid,
  actor uuid,
  payment_reference text
) returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_expiry timestamptz;
begin
  if auth.uid() is distinct from actor then
    raise exception 'Actor does not match authenticated user';
  end if;

  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = actor and ur.role::text = 'admin'
  ) then
    raise exception 'Only an administrator can confirm payments';
  end if;

  if target = actor then
    raise exception 'Administrator cannot confirm their own subscription';
  end if;

  if length(trim(coalesce(payment_reference, ''))) = 0 then
    raise exception 'Payment reference is required';
  end if;

  if not exists (select 1 from auth.users u where u.id = target) then
    raise exception 'Customer does not exist';
  end if;

  -- A renewal extends from the later of now or the current expiry, for exactly
  -- 30 x 24 hours. Duplicate references cannot grant another month.
  new_expiry := greatest(
    now(),
    coalesce((select s.expires_at from public.subscriptions s where s.user_id = target), now())
  ) + interval '30 days';

  insert into public.payments(user_id, amount_cents, confirmed_by, expires_at, reference)
  values (target, 5000, actor, new_expiry, trim(payment_reference));

  insert into public.subscriptions(user_id, blocked, expires_at)
  values (target, false, new_expiry)
  on conflict (user_id) do update
    set blocked = false, expires_at = excluded.expires_at;

  return new_expiry;
exception
  when unique_violation then
    raise exception 'This payment reference has already been used for this customer';
end;
$$;

revoke all on function public.confirm_monthly_payment(uuid, uuid, text) from public, anon;
grant execute on function public.confirm_monthly_payment(uuid, uuid, text) to authenticated, service_role;
