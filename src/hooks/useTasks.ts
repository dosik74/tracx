import { useEffect, useMemo, useState } from 'react';
import type { Task } from '../types';
import { supabase, supabaseEnabled } from '../utils/supabase';

const STORAGE_KEY = 'task-tracker:data:v1';

/** Р‘Р” -> РїСЂРёР»РѕР¶РµРЅРёРµ */
function rowToTask(r: Record<string, unknown>): Task {
  return {
    id: String(r.id),
    text: String(r.text ?? ''),
    done: r.done === true,
    date: typeof r.date === 'string' ? r.date : '',
    createdAt: typeof r.created_at === 'string' ? r.created_at : new Date().toISOString(),
    completedAt: typeof r.completed_at === 'string' ? r.completed_at : null,
  };
}

/** РџСЂРёР»РѕР¶РµРЅРёРµ -> Р‘Р” */
function taskToRow(t: Task) {
  return {
    id: t.id,
    text: t.text,
    done: t.done,
    date: t.date,
    created_at: t.createdAt,
    completed_at: t.completedAt,
  };
}

function loadLocal(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is Task =>
        typeof t === 'object' &&
        t !== null &&
        typeof (t as Task).id === 'string' &&
        typeof (t as Task).text === 'string'
    );
  } catch (err) {
    console.error('РќРµ СѓРґР°Р»РѕСЃСЊ РїСЂРѕС‡РёС‚Р°С‚СЊ РґР°РЅРЅС‹Рµ РёР· LocalStorage:', err);
    return [];
  }
}

function genId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Fire-and-forget запрос к Supabase с безаварийной обработкой ошибок */
function runSync(op: () => PromiseLike<{ error: { message: string } | null }>): void {
  void (async () => {
    try {
      const { error } = await op();
      if (error) console.warn('Supabase:', error.message);
    } catch (err) {
      console.warn('Supabase недоступен:', err);
    }
  })();
}
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadLocal);

  // Р›РѕРєР°Р»СЊРЅС‹Р№ РєСЌС€ вЂ” РІСЃРµРіРґР°
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РґР°РЅРЅС‹Рµ РІ LocalStorage:', err);
    }
  }, [tasks]);

  // РџРµСЂРІРёС‡РЅР°СЏ Р·Р°РіСЂСѓР·РєР° РёР· Supabase Рё СЃР»РёСЏРЅРёРµ СЃ РєСЌС€РµРј
  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      try {
        const { data, error } = await supabase.from('tasks').select('*');
        if (error) throw error;
        if (!data) return;
        const remote = data.map(rowToTask).filter(t => t.text);
        setTasks(prev => {
          const byId = new Map(prev.map(t => [t.id, t]));
          for (const rt of remote) byId.set(rt.id, rt); // РѕР±Р»Р°С‡РЅР°СЏ РІРµСЂСЃРёСЏ РїСЂРёРѕСЂРёС‚РµС‚РЅР°
          return [...byId.values()].sort((a, b) =>
            a.done !== b.done ? (a.done ? 1 : -1) : a.date < b.date ? -1 : 1
          );
        });
      } catch (err) {
        console.warn('Supabase РЅРµРґРѕСЃС‚СѓРїРµРЅ, СЂР°Р±РѕС‚Р°РµРј РѕС„Р»Р°Р№РЅ:', err);
      }
    })();
  }, []);

  const api = useMemo(
    () => ({
      addMany(texts: string[], date: string) {
        const now = new Date().toISOString();
        const fresh: Task[] = texts
          .map(t => t.trim())
          .filter(Boolean)
          .map(t => ({
            id: genId(),
            text: t,
            done: false,
            date,
            createdAt: now,
            completedAt: null,
          }));
        setTasks(prev => [...fresh, ...prev]);
        if (supabaseEnabled && fresh.length > 0) {
          runSync(() => supabase.from('tasks').insert(fresh.map(taskToRow)));
        }
      },
      toggle(id: string) {
        setTasks(prev =>
          prev.map(t => {
            if (t.id !== id) return t;
            const next: Task = {
              ...t,
              done: !t.done,
              completedAt: !t.done ? new Date().toISOString() : null,
            };
            if (supabaseEnabled) {
              runSync(() =>
                supabase
                  .from('tasks')
                  .update({ done: next.done, completed_at: next.completedAt })
                  .eq('id', id)
              );
            }
            return next;
          })
        );
      },
      update(id: string, patch: Partial<Pick<Task, 'text' | 'date' | 'done'>>) {
        setTasks(prev =>
          prev.map(t => {
            if (t.id !== id) return t;
            const next: Task = { ...t, ...patch };
            next.completedAt =
              next.done && !t.completedAt
                ? new Date().toISOString()
                : next.done
                  ? t.completedAt
                  : null;
            if (supabaseEnabled) {
              runSync(() => supabase.from('tasks').update(taskToRow(next)).eq('id', id));
            }
            return next;
          })
        );
      },
      remove(id: string) {
        setTasks(prev => prev.filter(t => t.id !== id));
        if (supabaseEnabled) {
          runSync(() => supabase.from('tasks').delete().eq('id', id));
        }
      },
      async replaceAll(next: Task[]) {
        setTasks(next);
        if (!supabaseEnabled) return;
        try {
          await supabase.from('tasks').delete().neq('id', '');
          if (next.length > 0) {
            const { error } = await supabase.from('tasks').insert(next.map(taskToRow));
            if (error) throw error;
          }
        } catch (err) {
          console.warn('Supabase replaceAll:', err);
        }
      },
      clearCompleted() {
        setTasks(prev => {
          const ids = prev.filter(t => t.done).map(t => t.id);
          if (supabaseEnabled && ids.length > 0) {
            runSync(() => supabase.from('tasks').delete().in('id', ids));
          }
          return prev.filter(t => !t.done);
        });
      },
    }),
    []
  );

  return { tasks, ...api };
}

export type TasksApi = ReturnType<typeof useTasks>;

