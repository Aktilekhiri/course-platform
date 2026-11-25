-- Run once in Supabase > SQL Editor. Gives the API roles table access; Row Level Security still decides who sees which rows.
grant usage on schema public to anon, authenticated;
grant select on public.courses, public.modules to anon;
grant insert on public.partner_applications to anon;
grant select, insert, update, delete on public.courses, public.modules, public.certificates to authenticated;
grant select, insert on public.enrollments to authenticated;
grant select, insert, update on public.submissions to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update on public.partner_applications to authenticated;
