import { useMemo } from 'react';
import { CheckCircle2, ListTodo, TrendingUp, Percent, Flame } from 'lucide-react';
import type { Task } from '../types';
import { today, toISODate } from '../utils/date';

interface Props {
  tasks: Task[];
}

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

export default function Profile({ tasks }: Props) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    const now = new Date();
    const weekAgoISO = toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    const monthAgoISO = toISODate(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() + 1));

    let weekDone = 0;
    let weekCreated = 0;
    let monthDone = 0;
    let monthCreated = 0;

    for (const t of tasks) {
      if (t.completedAt) {
        const cISO = t.completedAt.slice(0, 10);
        if (cISO >= weekAgoISO && cISO <= today()) {
          weekDone++;
          if (cISO >= monthAgoISO) monthDone++;
        }
      }
      if (t.createdAt.slice(0, 10) >= weekAgoISO && t.createdAt.slice(0, 10) <= today()) weekCreated++;
      if (t.createdAt.slice(0, 10) >= monthAgoISO && t.createdAt.slice(0, 10) <= today()) monthCreated++;
    }

    return { total, done, pct, weekDone, weekCreated, monthDone, monthCreated };
  }, [tasks]);

  const last7 = useMemo(() => {
    const days: { iso: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      days.push({
        iso,
        count: tasks.filter(t => t.completedAt?.slice(0, 10) === iso).length,
      });
    }
    return days;
  }, [tasks]);

  const maxDay = Math.max(1, ...last7.map(d => d.count));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Профиль</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ListTodo} label="Всего задач" value={String(stats.total)} />
        <StatCard
          icon={CheckCircle2}
          label={`Выполнено (${stats.done})`}
          value={`${stats.pct}%`}
        />
        <StatCard
          icon={Flame}
          label="Продуктивность за неделю"
          value={`${stats.weekDone} из ${stats.weekCreated}`}
        />
        <StatCard
          icon={TrendingUp}
          label="За месяц"
          value={`${stats.monthDone} из ${stats.monthCreated}`}
        />
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

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-zinc-400">Общий прогресс</span>
          <span className="font-semibold text-emerald-400">{stats.pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
            style={{ width: `${stats.pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
