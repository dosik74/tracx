import { CheckSquare, ListTodo, CalendarDays, User, Download, ShieldCheck, Settings } from 'lucide-react';
import type { Tab } from '../types';

interface Props {
  tab: Tab;
  onChange: (tab: Tab) => void;
  onExport: () => void;
}

const items: { id: Tab; label: string; icon: typeof CheckSquare }[] = [
  { id: 'tasks', label: 'Задачи', icon: CheckSquare },
  { id: 'list', label: 'Список', icon: ListTodo },
  { id: 'calendar', label: 'Календарь', icon: CalendarDays },
  { id: 'profile', label: 'Профиль', icon: User },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export default function Sidebar({ tab, onChange, onExport }: Props) {
  return (
    <aside className="flex h-full w-16 shrink-0 flex-col gap-2 border-r border-zinc-800 bg-zinc-950 p-3 md:w-56">
      <div className="mb-4 hidden items-center gap-2 px-2 md:flex">
        <ShieldCheck className="h-6 w-6 text-emerald-400" />
        <span className="font-monplesir text-2xl text-zinc-100 [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]">
          tracx
        </span>
      </div>
      <div className="flex flex-row justify-center gap-1 md:flex-col md:justify-start md:gap-1">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:flex-row ${
              tab === id
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={onExport}
        className="mt-auto flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-800/70 hover:text-zinc-300 md:flex-row"
        title="Скачать резервную копию (JSON)"
      >
        <Download className="h-5 w-5" />
        <span className="hidden md:inline">Резервная копия</span>
      </button>
    </aside>
  );
}
