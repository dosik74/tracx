import { CheckSquare, ListTodo, CalendarDays, User, Download, ShieldCheck, Settings } from 'lucide-react';
import type { Tab } from '../types';
import { useAuth } from '../hooks/useAuth';

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
  const { user, profile } = useAuth();
  return (
    <>
      {/* Мобильный нижний таб-бар — как в реальном приложении */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid grid-cols-5 px-1 pt-1">
          {items.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors active:scale-95 ${
                  active ? 'text-emerald-400' : 'text-zinc-500 active:text-zinc-200'
                }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                    active ? 'bg-emerald-500/15' : 'bg-transparent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Десктопный сайдбар */}
      <aside className="hidden h-full w-56 shrink-0 flex-col gap-1 border-r border-zinc-800 bg-zinc-950 p-3 md:flex">
        <div className="mb-4 flex items-center gap-2 px-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <span className="font-monplesir text-2xl text-zinc-100 [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]">
            tracx
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === id
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Пользователь */}
        {user && (
          <button
            onClick={() => onChange('profile')}
            className="mt-auto flex items-center gap-1.5 rounded-xl px-3 py-2 transition hover:bg-zinc-800/70"
            title="Профиль"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: `${profile?.avatar_color ?? '#10b981'}33` }}
            >
              {profile?.avatar_emoji || '🙂'}
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-xs font-medium text-zinc-200">
                {profile?.display_name || profile?.username || 'Профиль'}
              </span>
              <span className="block truncate text-[10px] text-zinc-500">@{profile?.username ?? 'user'}</span>
            </span>
          </button>
        )}

        <button
          onClick={onExport}
          className={`${user ? '' : 'mt-auto'} flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-800/70 hover:text-zinc-300`}
          title="Скачать резервную копию (JSON)"
        >
          <Download className="h-5 w-5" />
          <span>Резервная копия</span>
        </button>
      </aside>
    </>
  );
}
