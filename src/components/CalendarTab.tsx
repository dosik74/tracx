import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import type { Task } from '../types';
import TaskItem from './TaskItem';
import {
  monthGrid,
  monthLabel,
  isSameMonth,
  today,
  fromISODate,
  weekdayShort,
  mondayIndex,
  humanDate,
} from '../utils/date';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<Task, 'text' | 'date' | 'done'>>) => void;
  onRemove: (id: string) => void;
}

export default function CalendarTab({ tasks, onToggle, onUpdate, onRemove }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const grid = useMemo(() => monthGrid(year, month), [year, month]);
  const countsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) map.set(t.date, (map.get(t.date) ?? 0) + 1);
    return map;
  }, [tasks]);

  const selectedTasks = useMemo(
    () => (selected ? tasks.filter(t => t.date === selected) : []),
    [tasks, selected]
  );

  function shift(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <h1 className="text-2xl font-bold text-zinc-100">Календарь</h1>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => shift(-1)}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
            title="Предыдущий месяц"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="min-w-40 text-center text-lg font-semibold text-zinc-100">
              {monthLabel(year, month)}
            </span>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="hidden rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 outline-none [color-scheme:dark] sm:block"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {monthLabel(year, i).split(' ')[0]}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="hidden rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 outline-none [color-scheme:dark] sm:block"
            >
              {Array.from({ length: 21 }, (_, i) => now.getFullYear() - 10 + i).map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setYear(now.getFullYear());
                setMonth(now.getMonth());
              }}
              className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
              title="Текущий месяц"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => shift(1)}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
            title="Следующий месяц"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="pb-2 text-xs font-medium text-zinc-500">
              {weekdayShort(i)}
            </div>
          ))}
          {grid.map(iso => {
            const d = fromISODate(iso);
            const inMonth = isSameMonth(iso, year, month);
            const count = countsByDate.get(iso) ?? 0;
            const doneCount = tasks.filter(t => t.date === iso && t.done).length;
            const isToday = iso === today();
            const isSelected = iso === selected;
            const weekend = mondayIndex(d) >= 5;
            return (
              <button
                key={iso}
                onClick={() => setSelected(isSelected ? null : iso)}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border text-sm transition ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                    : isToday
                      ? 'border-zinc-600 bg-zinc-800 text-zinc-100'
                      : 'border-transparent text-zinc-400 hover:bg-zinc-800/60'
                } ${inMonth ? '' : 'opacity-30'} ${weekend && !isSelected ? 'text-red-400/80' : ''}`}
              >
                <span>{d.getDate()}</span>
                {count > 0 && (
                  <span className="flex items-center gap-0.5">
                    {count > doneCount && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                    {doneCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 flex items-center justify-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> активные
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" /> выполненные
          </span>
        </p>
      </div>

      {selected && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-200">
            Задачи на {humanDate(selected)}{' '}
            <span className="text-sm font-normal text-zinc-500">({selectedTasks.length})</span>
          </h2>
          {selectedTasks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
              На этот день задач нет.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
