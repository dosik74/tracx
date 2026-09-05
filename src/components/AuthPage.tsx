import { useState } from 'react';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const { signIn, signInWithGoogle, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim() || !password) return;
    setBusy(true);
    try {
      const err =
        mode === 'login'
          ? await signIn(email.trim(), password)
          : await signUp(email.trim(), password, username.trim() || email.split('@')[0]);
      if (err) {
        if (/Подтвердите email/.test(err)) setNotice(err);
        else setError(err);
      }
    } finally {
      setBusy(false);
    }
  }

  async function signInGoogle() {
    setError(null);
    setNotice(null);
    setBusy(true);
    const err = await signInWithGoogle();
    if (err) setError(err);
    setBusy(false);
  }

  const inputCls =
    'w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-10 pr-4 py-3 text-base text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-emerald-500';

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-zinc-950 p-4 pb-[env(safe-area-inset-bottom)]">
      {/* Фоновое свечение */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="anim-tab-in relative w-full max-w-sm">
        <div className="mb-6 text-center sm:mb-8">
          <ShieldCheck className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
          <h1 className="font-monplesir text-5xl text-zinc-100 [text-shadow:0_6px_32px_rgba(0,0,0,1)] sm:text-6xl">
            tracx
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {mode === 'login' ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-[0_-12px_48px_-8px_rgba(16,185,129,0.15)] backdrop-blur">
          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Имя пользователя"
                  autoComplete="username"
                  className={inputCls}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                required
                className={inputCls}
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Пароль"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                className={inputCls}
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
            )}
            {notice && (
              <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">{notice}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-40"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'login' ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-zinc-600">
            <span className="h-px flex-1 bg-zinc-800" />
            <span>или</span>
            <span className="h-px flex-1 bg-zinc-800" />
          </div>

          <button
            type="button"
            onClick={signInGoogle}
            disabled={busy}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-40"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#4285f4]">G</span>
            {mode === 'login' ? 'Войти через Google' : 'Зарегистрироваться через Google'}
          </button>

          <button
            onClick={() => {
              setMode(m => (m === 'login' ? 'register' : 'login'));
              setError(null);
              setNotice(null);
            }}
            className="mt-4 min-h-[44px] w-full px-2 py-2.5 text-center text-xs text-zinc-500 transition hover:text-emerald-400"
          >
            {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}
