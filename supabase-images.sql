-- ============================================================
-- tracx: изображения профиля (аватар/фон)
-- Запустите в Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

alter table public.profiles add column if not exists avatar_image text;
alter table public.profiles add column if not exists cover_image text;
