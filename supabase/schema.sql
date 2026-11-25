-- NextGen schema. Paste into Supabase > SQL Editor > Run. Safe to run once on an empty project.

-- ========== helpers ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student','instructor','admin')),
  created_at timestamptz not null default now()
);

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create function public.is_instructor() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('instructor','admin'));
$$;

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          new.raw_user_meta_data->>'avatar_url');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ========== courses ==========
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  owner_id uuid not null references public.profiles(id),
  title_ru text, title_en text,
  description_ru text, description_en text,
  category text,
  language text not null default 'ru',
  status text not null default 'draft' check (status in ('draft','pending','published')),
  created_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  position int not null,
  title_ru text, title_en text,
  theory_ru text, theory_en text,
  video_url text,
  practice_ru text, practice_en text,
  homework_ru text, homework_en text,
  unique (course_id, position)
);

create table public.enrollments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  kind text not null check (kind in ('practice','homework')),
  text_content text,
  link_url text,
  file_path text,
  status text not null default 'pending' check (status in ('pending','accepted','needs_work','with_teacher')),
  ai_feedback text,
  reviewer_id uuid references public.profiles(id),
  review_comment text,
  consent_ai boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  code text not null unique default substr(replace(gen_random_uuid()::text,'-',''),1,12),
  status text not null default 'pending' check (status in ('pending','approved','revoked')),
  issued_at timestamptz,
  unique (user_id, course_id)
);

create table public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  telegram text,
  topic text not null,
  description text,
  consent boolean not null check (consent = true),
  status text not null default 'new' check (status in ('new','contacted','approved','rejected')),
  created_at timestamptz not null default now()
);

-- ========== access helpers that need course ownership ==========
create function public.owns_course(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.courses where id = cid and owner_id = auth.uid());
$$;

create function public.owns_module(mid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.modules m join public.courses c on c.id = m.course_id
                 where m.id = mid and c.owner_id = auth.uid());
$$;

-- ========== Row Level Security ==========
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.enrollments enable row level security;
alter table public.submissions enable row level security;
alter table public.certificates enable row level security;
alter table public.partner_applications enable row level security;

-- profiles: see/edit own; admin sees all. Role cannot be changed from the browser.
create policy "profiles read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "profiles update own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated, anon;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- courses: everyone reads published; owner and admin read their own; instructors manage own, only admin publishes
create policy "courses read" on public.courses for select to anon, authenticated
  using (status = 'published' or owner_id = auth.uid() or public.is_admin());
create policy "courses insert" on public.courses for insert to authenticated
  with check (public.is_instructor() and owner_id = auth.uid() and (status in ('draft','pending') or public.is_admin()));
create policy "courses update" on public.courses for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check ((owner_id = auth.uid() and status in ('draft','pending')) or public.is_admin());
create policy "courses delete" on public.courses for delete to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- modules follow their course
create policy "modules read" on public.modules for select to anon, authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and c.status = 'published')
         or public.owns_course(course_id) or public.is_admin());
create policy "modules write" on public.modules for all to authenticated
  using (public.owns_course(course_id) or public.is_admin())
  with check (public.owns_course(course_id) or public.is_admin());

-- enrollments
create policy "enroll own read" on public.enrollments for select to authenticated
  using (user_id = auth.uid() or public.owns_course(course_id) or public.is_admin());
create policy "enroll own insert" on public.enrollments for insert to authenticated
  with check (user_id = auth.uid()
    and exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));

-- submissions: student creates pending ones; student, course owner and admin read; only owner/admin review
create policy "sub read" on public.submissions for select to authenticated
  using (user_id = auth.uid() or public.owns_module(module_id) or public.is_admin());
create policy "sub insert" on public.submissions for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and reviewer_id is null and ai_feedback is null);
create policy "sub review" on public.submissions for update to authenticated
  using (public.owns_module(module_id) or public.is_admin())
  with check (public.owns_module(module_id) or public.is_admin());

-- certificates: student reads own; owner/admin issue
create policy "cert read" on public.certificates for select to authenticated
  using (user_id = auth.uid() or public.owns_course(course_id) or public.is_admin());
create policy "cert write" on public.certificates for all to authenticated
  using (public.owns_course(course_id) or public.is_admin())
  with check (public.owns_course(course_id) or public.is_admin());

-- partner applications: anyone can send, only admin reads and manages
create policy "partner send" on public.partner_applications for insert to anon, authenticated
  with check (consent = true and status = 'new');
create policy "partner admin" on public.partner_applications for select to authenticated
  using (public.is_admin());
create policy "partner admin update" on public.partner_applications for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- public certificate check by code (returns only safe fields)
create function public.verify_certificate(p_code text)
returns table (holder text, course text, issued_at timestamptz, status text)
language sql stable security definer set search_path = '' as $$
  select p.full_name, coalesce(c.title_en, c.title_ru), ce.issued_at, ce.status
  from public.certificates ce
  join public.profiles p on p.id = ce.user_id
  join public.courses c on c.id = ce.course_id
  where ce.code = p_code and ce.status in ('approved','revoked');
$$;
grant execute on function public.verify_certificate(text) to anon, authenticated;
