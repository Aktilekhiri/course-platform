-- 008: вход через Telegram. У таких пользователей нет почты, поэтому админу нужно имя пользователя Telegram.
alter table public.profiles add column if not exists tg_username text;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, tg_username)
  values (new.id, new.email, 'user' || nextval('public.user_number_seq'),
          case when new.raw_app_meta_data->>'provider' = 'custom:telegram'
               then nullif(new.raw_user_meta_data->>'preferred_username','') end);
  return new;
end $$;
