import { useMemo, useState } from 'react';
import { ListFilter, Trash, ListTodo } from 'lucide-react';
import type { DayFilter, Task, TaskStatus } from '../types';
import type { TasksApi } from '../hooks/useTasks';
import { useSettings } from '../hooks/useSettings';
import TaskItem from './TaskItem';
import { today, tomorrow } from '../utils/date';

interface Props {
  tasks: Task[];
  api: TasksApi;
}

export default function TaskList({ tasks, api }: Props) {
  const [dayFilter, setDayFilter] = useState<DayFilter>('all');
  const [customDate, setCustomDate] = useState(today());
  const [status, setStatus] = useState<TaskStatus>('all');
  const { settings } = useSettings();

  const filtered = useMemo(() => {
    return tasks
      .filter(t => {
        if (dayFilter === 'today') return t.date === today();
        if (dayFilter === 'tomorrow') return t.date === tomorrow();
        if (dayFilter === 'custom') return t.date === customDate;
        return true;
      })
      .filter(t => {
        if (status !== 'all') return status === 'done' ? t.done : !t.done;
        // Приватность: выполненные скрываются из общего списка
        if (settings.hideCompleted && t.done) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        if (a.date !== b.date) return a.date < b.date ? -1 : 1;
        return a.createdAt < b.createdAt ? 1 : -1;
      });
  }, [tasks, dayFilter, customDate, status, settings.hideCompleted]);

  const doneCount = filtered.filter(t => t.done).length;
  const pct = filtered.length === 0 ? 0 : Math.round((doneCount / filtered.length) * 100);

  const dayButtons: [DayFilter, string][] = [
    ['all', 'Все дни'],
    ['today', 'Сегодня'],
    ['tomorrow', 'Завтра'],
  ];
  const statusButtons: [TaskStatus, string][] = [
    ['all', 'Все'],
    ['active', 'Активные'],
    ['done', 'Выполненные'],
  ];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="flex min-w-0 flex-1 items-center gap-2 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          <ListTodo className="h-7 w-7 shrink-0 text-emerald-400 sm:h-8 sm:w-8" />
          <span className="truncate">Список задач</span>
          <span className="shrink-0 rounded-full bg-zinc-800 px-3 py-1 text-sm font-semibold text-zinc-300">
            {filtered.length}
          </span>
        </h1>
        {filtered.length > 0 && (
          <span className="shrink-0 text-sm text-zinc-500">
            Выполнено <span className="font-semibold text-emerald-400">{pct}%</span>
          </span>
        )}
      </div>

      {/* Прогресс-бар */}
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
          <ListFilter className="h-4 w-4" /> Фильтры:
        </div>
        <div className="flex gap-1 overflow-x-auto pb-0.5">
          {dayButtons.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setDayFilter(id)}
              className={`min-h-[40px] shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition active:scale-95 ${
                dayFilter === id ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
          <input
            type="date"
            value={customDate}
            onChange={e => {
              if (e.target.value) {
                setCustomDate(e.target.value);
                setDayFilter('custom');
              }
            }}
            aria-label="Выбрать дату"
            className={`min-h-[40px] shrink-0 rounded-lg px-2 py-2 text-xs outline-none [color-scheme:dark] ${
              dayFilter === 'custom' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-400'
            }`}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto border-t border-zinc-800/70 pb-0.5 pt-2.5">
          {statusButtons.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setStatus(id)}
              className={`min-h-[40px] flex-1 shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition active:scale-95 sm:flex-none ${
                status === id ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500 sm:p-14">
          Задач не найдено. Добавьте их на вкладке «Задачи».
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {filtered.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={api.toggle}
                onUpdate={api.update}
                onRemove={api.remove}
              />
            ))}
          </ul>
          <div className="flex items-center justify-between gap-2 px-1 pb-2 text-xs text-zinc-500">
            <span>Показано: {filtered.length}</span>
            {status !== 'done' && doneCount > 0 && (
              <button
                onClick={api.clearCompleted}
                className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 py-2 transition hover:text-red-400 active:scale-95"
              >
                <Trash className="h-3.5 w-3.5" /> Очистить выполненные
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
