-- ============================================================
-- tracx: схема базы Supabase
-- Запустите этот скрипт в Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

create table if not exists public.tasks (
  id text primary key,
  text text not null,
  done boolean not null default false,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Включаем RLS и открываем доступ анонимно (пока без авторизации)
alter table public.tasks enable row level security;

drop policy if exists "tracx_public_access" on public.tasks;
create policy "tracx_public_access"
  on public.tasks
  for all
  using (true)
  with check (true);
