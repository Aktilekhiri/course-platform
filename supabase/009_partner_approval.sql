-- 009: одобрение заявки партнёра само делает пользователя преподавателем (по совпадению почты).
create or replace function public.promote_on_approval() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    update public.profiles set role = 'instructor'
    where lower(email) = lower(new.email) and role = 'student';
  end if;
  return new;
end $$;

drop trigger if exists partner_approved on public.partner_applications;
create trigger partner_approved after update of status on public.partner_applications
  for each row execute function public.promote_on_approval();

-- Если человек зарегистрируется позже, чем одобрили заявку, роль выдаётся при первом входе.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, tg_username, role)
  values (new.id, new.email, 'user' || nextval('public.user_number_seq'),
          case when new.raw_app_meta_data->>'provider' = 'custom:telegram'
               then nullif(new.raw_user_meta_data->>'preferred_username','') end,
          case when exists (select 1 from public.partner_applications
                            where status = 'approved' and lower(email) = lower(new.email))
               then 'instructor' else 'student' end);
  return new;
end $$;

-- Бот работает от service_role: ему нужен доступ к заявкам.
grant select, update on public.partner_applications to service_role;

-- Уже одобренные заявки: выдать роль тем, кто успел зарегистрироваться.
update public.profiles set role = 'instructor'
where role = 'student'
  and lower(email) in (select lower(email) from public.partner_applications where status = 'approved');
