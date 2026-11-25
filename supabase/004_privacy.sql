-- Run once in Supabase > SQL Editor. Consent log, data requests, guardian-consent placeholder, no public certificate lookup.

-- 1) Consent log: who, when, which versions, status, withdrawal date. Browser can only add 'given' rows or call withdraw_consent().
create table public.consent_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  purpose text not null default 'platform_processing',
  consent_version text not null,
  policy_version text not null,
  status text not null default 'given' check (status in ('given','withdrawn')),
  given_at timestamptz not null default now(),
  withdrawn_at timestamptz
);
alter table public.consent_log enable row level security;
create policy "consent read" on public.consent_log for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "consent give" on public.consent_log for insert to authenticated
  with check (user_id = auth.uid() and status = 'given' and withdrawn_at is null);
grant select, insert on public.consent_log to authenticated;

create function public.withdraw_consent() returns void
language sql security definer set search_path = '' as $$
  update public.consent_log set status = 'withdrawn', withdrawn_at = now()
  where user_id = auth.uid() and status = 'given';
$$;
revoke execute on function public.withdraw_consent() from public, anon;
grant execute on function public.withdraw_consent() to authenticated;

-- 2) Requests about personal data (deletion request, questions). Handled manually by the admin.
create table public.data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('deletion','question')),
  message text check (char_length(message) <= 2000),
  status text not null default 'new' check (status in ('new','in_progress','done','rejected')),
  created_at timestamptz not null default now()
);
alter table public.data_requests enable row level security;
create policy "req own read" on public.data_requests for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "req own insert" on public.data_requests for insert to authenticated
  with check (user_id = auth.uid() and status = 'new');
create policy "req admin update" on public.data_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant select, insert, update on public.data_requests to authenticated;

-- 3) Placeholder for guardian consent (not used by the site yet; rules wait for the Agency's answer)
create table public.guardian_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  guardian_name text,
  guardian_contact text,
  consent_version text,
  status text not null default 'pending' check (status in ('pending','given','withdrawn')),
  created_at timestamptz not null default now(),
  given_at timestamptz
);
alter table public.guardian_consents enable row level security;
create policy "guardian read" on public.guardian_consents for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
grant select on public.guardian_consents to authenticated;

-- 4) No public certificate lookup (it exposed the holder's name). Add it back only after the legal basis is confirmed.
drop function if exists public.verify_certificate(text);
