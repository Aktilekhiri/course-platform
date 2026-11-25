-- Run once in Supabase > SQL Editor. Instructors cannot change modules of a published course (admin can).
drop policy if exists "modules write" on public.modules;
create policy "modules write" on public.modules for all to authenticated
  using (
    public.is_admin()
    or (public.owns_course(course_id)
        and not exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'))
  )
  with check (
    public.is_admin()
    or (public.owns_course(course_id)
        and not exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'))
  );
