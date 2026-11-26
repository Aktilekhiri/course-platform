-- 006: сдача практики, проверка ИИ, проверка преподавателем. Запустить один раз в SQL Editor.
-- старая пустая таблица submissions из первой схемы заменяется новой
drop table if exists public.submissions cascade;
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  body text check (char_length(body) <= 6000),
  link text check (char_length(link) <= 500),
  image_paths text[] not null default '{}' check (cardinality(image_paths) <= 3),
  status text not null default 'pending' check (status in ('pending','ai_accepted','needs_teacher','revise','accepted')),
  ai_score int check (ai_score between 1 and 5),
  ai_feedback_ru text, ai_feedback_en text,
  teacher_feedback text check (char_length(teacher_feedback) <= 2000),
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  checked_at timestamptz,
  check (coalesce(body,'') <> '' or coalesce(link,'') <> '' or cardinality(image_paths) > 0)
);
create index on public.submissions (user_id, module_id, created_at desc);
create index on public.submissions (status, created_at desc);
alter table public.submissions enable row level security;

-- студент видит свои работы; преподаватель курса и админ видят работы своих модулей
create policy "subs read" on public.submissions for select to authenticated
  using (user_id = auth.uid() or public.is_admin() or public.owns_module(module_id));
-- студент может только создать работу со статусом pending
create policy "subs insert own" on public.submissions for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and ai_score is null and reviewed_by is null);
-- решение принимают только преподаватель курса или админ
create policy "subs teacher update" on public.submissions for update to authenticated
  using (public.is_admin() or public.owns_module(module_id))
  with check (public.is_admin() or public.owns_module(module_id));

grant select, insert on public.submissions to authenticated;
grant update (status, teacher_feedback, reviewed_by, checked_at) on public.submissions to authenticated;
grant all on public.submissions to service_role;

-- приватное хранилище для скриншотов: путь {user_id}/{submission_id}/{n}.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submissions', 'submissions', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "subs files insert own" on storage.objects;
drop policy if exists "subs files read" on storage.objects;
create policy "subs files insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9]\.(jpg|png|webp)$');
create policy "subs files read" on storage.objects for select to authenticated
  using (bucket_id = 'submissions' and (
    (storage.foldername(name))[1] = auth.uid()::text or public.is_admin()
    or exists (select 1 from public.submissions s
               where s.id::text = (storage.foldername(name))[2] and public.owns_module(s.module_id))));
