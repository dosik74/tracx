import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseEnabled } from '../utils/supabase';

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_emoji: string;
  avatar_color: string;
}

interface AuthCtx {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, username: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  saveProfile: (patch: Partial<Profile>) => Promise<string | null>;
}

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => 'Supabase не подключён',
  signUp: async () => 'Supabase не подключён',
  signOut: async () => undefined,
  saveProfile: async () => 'Supabase не подключён',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(supabaseEnabled);

  useEffect(() => {
    if (!supabaseEnabled) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => undefined)
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Загрузка профиля
  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    (async () => {
        try {
          const uid = session.user.id;
          let data: Profile | null = null;
          const fetchRes = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .maybeSingle();
          if (fetchRes.error) throw fetchRes.error;
          data = (fetchRes.data as Profile | null) ?? null;
          if (!data) {
            // Профиль мог не создаться триггером — создаём сами
            const meta = session.user.user_metadata as Record<string, string> | undefined;
            const fallbackUsername =
              meta?.username || session.user.email?.split('@')[0] || 'user';
            const upsertRes = await supabase
              .from('profiles')
              .upsert({
                id: uid,
                username: fallbackUsername,
                display_name: meta?.username ?? null,
              })
              .select()
              .maybeSingle();
            if (upsertRes.error) throw upsertRes.error;
            data = (upsertRes.data as Profile | null) ?? {
              id: uid,
              username: fallbackUsername,
              display_name: meta?.username ?? null,
              bio: null,
              avatar_emoji: '🙂',
              avatar_color: '#10b981',
            };
          }
          setProfile(data);
        } catch (err) {
          console.warn('Не удалось загрузить профиль:', err);
        }
    })();
  }, [session]);

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      async signIn(email, password) {
        try {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          return error ? translateAuthError(error.message) : null;
        } catch (err) {
          return err instanceof Error ? err.message : 'Ошибка входа';
        }
      },
      async signUp(email, password, username) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } },
          });
          if (error) return translateAuthError(error.message);
          if (data.session === null && data.user !== null) {
            return 'Аккаунт создан! Подтвердите email по письму и войдите.';
          }
          return null;
        } catch (err) {
          return err instanceof Error ? err.message : 'Ошибка регистрации';
        }
      },
      async signOut() {
        if (!supabaseEnabled) return;
        await supabase.auth.signOut().catch(() => undefined);
      },
      async saveProfile(patch) {
        if (!supabaseEnabled) return 'Supabase не подключён';
        if (!session?.user) return 'Нет сессии';
        try {
          const base: Profile = profile ?? {
            id: session.user.id,
            username: null,
            display_name: null,
            bio: null,
            avatar_emoji: '🙂',
            avatar_color: '#10b981',
          };
          const next: Profile = { ...base, ...patch, id: session.user.id };
          const { error } = await supabase
            .from('profiles')
            .upsert(next as unknown as Record<string, unknown>);
          if (error) throw error;
          setProfile(next);
          return null;
        } catch (err) {
          console.warn('saveProfile:', err);
          return err instanceof Error ? err.message : 'Ошибка сохранения';
        }
      },
    }),
    [session, profile, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function translateAuthError(msg: string): string {
  if (/invalid login/i.test(msg)) return 'Неверный email или пароль.';
  if (/already registered|already exists/i.test(msg)) return 'Этот email уже зарегистрирован.';
  if (/password should be at least/i.test(msg)) return 'Пароль должен быть минимум 6 символов.';
  if (/valid email/i.test(msg)) return 'Введите корректный email.';
  if (/rate limit/i.test(msg)) return 'Слишком много попыток. Подождите немного.';
  return msg;
}

export function useAuth(): AuthCtx {
  return useContext(Ctx);
}
