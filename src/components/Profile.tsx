import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ListTodo, TrendingUp, Percent, Flame, Save, LogOut } from 'lucide-react';
import type { Task } from '../types';
import { useAuth } from '../hooks/useAuth';
import { today, toISODate } from '../utils/date';

const EMOJIS = ['🙂', '🚀', '🔥', '⚡', '🎯', '🦊', '🐼', '🦉', '🐺', '🌟', '👑', '💎'];
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

function StatCard({ icon: Icon, label, value }: { icon: typeof ListTodo; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
        <Icon className="h-5 w-5 text-emerald-400" />
      </div>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

export default function Profile({ tasks }: { tasks: Task[] }) {
  const { user, profile, saveProfile, signOut } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [emoji, setEmoji] = useState('🙂');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.display_name ?? '');
      setBio(profile.bio ?? '');
      setEmoji(profile.avatar_emoji || '🙂');
      setColor(profile.avatar_color || COLORS[0]);
    }
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const err = await saveProfile({ display_name: name.trim(), bio: bio.trim(), avatar_emoji: emoji, avatar_color: color });
    setSaving(false);
    if (!err) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    }
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    const now = new Date();
    const weekAgoISO = toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    const monthAgoISO = toISODate(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() + 1));
    let weekDone = 0, weekCreated = 0, monthDone = 0, monthCreated = 0;
    for (const t of tasks) {
      if (t.completedAt) {
        const cISO = t.completedAt.slice(0, 10);
        if (cISO >= weekAgoISO && cISO <= today()) {
          weekDone++;
          if (cISO >= monthAgoISO) monthDone++;
        }
      }
      const crISO = t.createdAt.slice(0, 10);
      if (crISO >= weekAgoISO && crISO <= today()) weekCreated++;
      if (crISO >= monthAgoISO && crISO <= today()) monthCreated++;
    }
    return { total, done, pct, weekDone, weekCreated, monthDone, monthCreated };
  }, [tasks]);

  const last7 = useMemo(() => {
    const days: { iso: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      days.push({ iso, count: tasks.filter(t => t.completedAt?.slice(0, 10) === iso).length });
    }
    return days;
  }, [tasks]);
  const maxDay = Math.max(1, ...last7.map(d => d.count));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Карточка профиля */}
      <div className="flex items-center gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-4xl shadow-lg"
          style={{ backgroundColor: `${color}33`, boxShadow: `0 0 24px ${color}44` }}
        >
          {emoji}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-zinc-100">
            {profile?.display_name || profile?.username || 'Профиль'}
          </h1>
          <p className="text-sm text-zinc-500">@{profile?.username ?? user?.email?.split('@')[0]}</p>
          {profile?.bio && <p className="mt-1 text-sm text-zinc-400">{profile.bio}</p>}
        </div>
        <button
          onClick={() => void signOut()}
          className="ml-auto flex shrink-0 items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-red-500/50 hover:text-red-400"
          title="Выйти из аккаунта"
        >
          <LogOut className="h-4 w-4" /> Выйти
        </button>
      </div>

      {/* Кастомизация */}
      <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-sm font-semibold text-zinc-300">Кастомизация профиля</h2>

        <label className="block space-y-1.5">
          <span className="text-xs text-zinc-500">Отображаемое имя</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={40}
            placeholder="Как вас показывать"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-emerald-500"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs text-zinc-500">О себе</span>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={160}
            rows={2}
            placeholder="Пара слов о себе…"
            className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-emerald-500"
          />
        </label>

        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500">Аватар</span>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
                  emoji === e ? 'ring-2 ring-emerald-500 bg-emerald-500/15 scale-110' : 'bg-zinc-800/70 hover:bg-zinc-800'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500">Цвет аватара</span>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-9 w-9 rounded-xl transition ${
                  color === c ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white/80 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-40"
        >
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? 'Сохранение…' : saved ? 'Сохранено!' : 'Сохранить профиль'}
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ListTodo} label="Всего задач" value={String(stats.total)} />
        <StatCard icon={CheckCircle2} label={`Выполнено (${stats.done})`} value={`${stats.pct}%`} />
        <StatCard icon={Flame} label="За неделю" value={`${stats.weekDone} из ${stats.weekCreated}`} />
        <StatCard icon={TrendingUp} label="За месяц" value={`${stats.monthDone} из ${stats.monthCreated}`} />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Percent className="h-4 w-4 text-emerald-400" /> Выполнение за последние 7 дней
        </h2>
        <div className="flex h-40 items-end gap-2">
          {last7.map(d => (
            <div key={d.iso} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs text-zinc-500">{d.count || ''}</span>
              <div
                className="w-full rounded-t-lg bg-emerald-500/70 transition-all"
                style={{ height: `${Math.max(4, (d.count / maxDay) * 120)}px` }}
              />
              <span className="text-[10px] text-zinc-500">{d.iso.slice(8)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
