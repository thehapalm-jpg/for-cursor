-- Терапевтический сервис: модульные данные пользователя
-- Выполни в Supabase → SQL Editor (один раз)

create table if not exists public.user_module_data (
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id text not null default 'song-therapy',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

create index if not exists user_module_data_updated_at_idx
  on public.user_module_data (updated_at desc);

alter table public.user_module_data enable row level security;

create policy "Users read own module data"
  on public.user_module_data for select
  using (auth.uid() = user_id);

create policy "Users insert own module data"
  on public.user_module_data for insert
  with check (auth.uid() = user_id);

create policy "Users update own module data"
  on public.user_module_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own module data"
  on public.user_module_data for delete
  using (auth.uid() = user_id);

-- Авто-обновление updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_module_data_updated_at on public.user_module_data;
create trigger user_module_data_updated_at
  before update on public.user_module_data
  for each row execute function public.set_updated_at();
