import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config';

export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Клиент создаётся только если заданы переменные окружения (иначе офлайн-режим) */
export const supabase: SupabaseClient = supabaseEnabled
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : (undefined as unknown as SupabaseClient);
