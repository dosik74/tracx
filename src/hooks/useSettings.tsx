import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export interface Settings {
  /** Анимация появления новых задач */
  taskAppear: boolean;
  /** Пульс чекбокса при отметке */
  checkPulse: boolean;
  /** Вспышка при удалении */
  removeFlash: boolean;
  /** Свечение панели ввода */
  inputGlow: boolean;
  /** Переходы между вкладками */
  tabTransition: boolean;
  /** Приватный режим: размывать текст выполненных задач */
  blurCompleted: boolean;
  /** Скрывать выполненные задачи из общего списка */
  hideCompleted: boolean;
  /** Все анимации сразу */
  allEnabled: boolean;
}

const DEFAULTS: Settings = {
  taskAppear: true,
  checkPulse: true,
  removeFlash: true,
  inputGlow: true,
  tabTransition: true,
  blurCompleted: false,
  hideCompleted: false,
  allEnabled: true,
};

const STORAGE_KEY = 'tracx:settings';

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

interface Ctx {
  settings: Settings;
  toggle: (key: keyof Settings) => void;
}

const SettingsCtx = createContext<Ctx>({ settings: DEFAULTS, toggle: () => undefined });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* игнорируем ошибки записи */
    }

    // Глобальный флаг: когда выключено — CSS-анимации не выполняются
    document.documentElement.style.setProperty(
      '--anim',
      settings.allEnabled ? '1' : '0'
    );
  }, [settings]);

  const ctx = useMemo<Ctx>(
    () => ({
      settings,
      toggle: key => {
        setSettings(prev => {
          if (key === 'allEnabled') {
            const on = !prev.allEnabled;
            return {
              taskAppear: on,
              checkPulse: on,
              removeFlash: on,
              inputGlow: on,
              tabTransition: on,
              blurCompleted: prev.blurCompleted,
              hideCompleted: prev.hideCompleted,
              allEnabled: on,
            };
          }
          const next = { ...prev, [key]: !prev[key] };
          next.allEnabled = Object.entries(next)
            .filter(([k]) => k !== 'allEnabled')
            .every(([, v]) => v);
          return next;
        });
      },
    }),
    [settings]
  );

  return <SettingsCtx.Provider value={ctx}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  return useContext(SettingsCtx);
}
