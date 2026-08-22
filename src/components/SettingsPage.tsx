import { Sparkles, Eye, EyeOff, CheckSquare, Trash2, Sun, ArrowLeftRight, Power } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import type { Settings as SettingsState } from '../hooks/useSettings';

const TOGGLES: {
  key: Exclude<keyof SettingsState, 'allEnabled'>;
  label: string;
  description: string;
  icon: typeof Sparkles;
}[] = [
  {
    key: 'taskAppear',
    label: 'Появление задач',
    description: 'Новые задачи плавно вылетают сверху с лёгким блюром',
    icon: Sparkles,
  },
  {
    key: 'checkPulse',
    label: 'Пульс галочки',
    description: 'Чекбокс пружинит при отметке выполнения',
    icon: CheckSquare,
  },
  {
    key: 'removeFlash',
    label: 'Удаление с эффектом',
    description: 'Задача краснеет и уезжает при удалении',
    icon: Trash2,
  },
  {
    key: 'inputGlow',
    label: 'Свечение панели ввода',
    description: 'Мягкое свечение над композером и пульс при работе AI',
    icon: Sun,
  },
  {
    key: 'tabTransition',
    label: 'Переходы между вкладками',
    description: 'Контент плавно всплывает при смене раздела',
    icon: ArrowLeftRight,
  },
  {
    key: 'blurCompleted',
    label: 'Приватный режим выполненных',
    description: 'Текст выполненных задач размывается — наведите, чтобы прочитать',
    icon: EyeOff,
  },
  {
    key: 'hideCompleted',
    label: 'Скрывать выполненные',
    description: 'Выполненные задачи не показываются в списке (кроме фильтра «Выполненные»)',
    icon: Eye,
  },
];

function Toggle({
  on,
  onClick,
}: {
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        on ? 'bg-emerald-500' : 'bg-zinc-700'
      }`}
      role="switch"
      aria-checked={on}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
          on ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { settings, toggle } = useSettings();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-zinc-100">Настройки</h1>

      <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <Power className="h-4 w-4" /> Все анимации
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Мгновенно включает или выключает всю анимацию в приложении
          </p>
        </div>
        <Toggle on={settings.allEnabled} onClick={() => toggle('allEnabled')} />
      </div>

      <div className="space-y-2">
        {TOGGLES.map(({ key, label, description, icon: Icon }) => (
          <div
            key={key}
            className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
              settings[key] ? 'border-zinc-800 bg-zinc-900/60' : 'border-zinc-800/50 bg-zinc-900/30 opacity-60'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                settings[key] ? 'bg-emerald-500/15' : 'bg-zinc-800'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${settings[key] ? 'text-emerald-400' : 'text-zinc-600'}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-100">{label}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
            </div>
            <Toggle on={settings[key]} onClick={() => toggle(key)} />
          </div>
        ))}
      </div>

      <p className="flex items-center gap-2 px-1 text-xs text-zinc-600">
        <Eye className="h-3.5 w-3.5" /> Настройки сохраняются автоматически в этом браузере.
      </p>
    </div>
  );
}
