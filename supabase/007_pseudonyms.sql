-- 007: новые пользователи получают ник вида user1038, а не имя из Google или почту.
create sequence if not exists public.user_number_seq start 1001;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, 'user' || nextval('public.user_number_seq'));
  return new;
end $$;

grant usage on sequence public.user_number_seq to service_role, postgres;

-- ОПЦИОНАЛЬНО: заменить ники у уже зарегистрированных, кроме админов.
-- Меняются только те, у кого имя совпадает с именем из Google или с частью почты до @ (то есть ник не выбирали сами).
-- Если не нужно, не запускай этот блок.
update public.profiles p
set full_name = 'user' || nextval('public.user_number_seq')
from auth.users a
where a.id = p.id
  and p.role <> 'admin'
  and (p.full_name is null
       or p.full_name = split_part(p.email, '@', 1)
       or p.full_name = coalesce(a.raw_user_meta_data->>'full_name', a.raw_user_meta_data->>'name'));
