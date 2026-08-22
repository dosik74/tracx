import type { BackupData, Task } from '../types';
import { today } from './date';

export function exportBackup(tasks: Task[]): void {
  const data: BackupData = {
    app: 'task-tracker',
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
  };
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-tracker-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Ошибка экспорта:', err);
    alert('Не удалось создать файл резервной копии.');
  }
}

/** Валидирует и возвращает задачи из файла бэкапа. Бросает Error с понятным сообщением. */
export function parseBackup(raw: string): Task[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Файл не является корректным JSON.');
  }

  const obj = parsed as Record<string, unknown> | null;
  if (!obj || typeof obj !== 'object') throw new Error('Некорректная структура файла.');
  if (obj.app !== 'task-tracker') throw new Error('Это резервная копия другого приложения.');
  if (!Array.isArray(obj.tasks)) throw new Error('В файле отсутствует массив задач.');

  return obj.tasks.map((item, i): Task => {
    const t = item as Record<string, unknown>;
    if (!t || typeof t !== 'object') throw new Error(`Задача №${i + 1} повреждена.`);
    if (typeof t.text !== 'string' || !t.text.trim()) throw new Error(`Задача №${i + 1}: пустой текст.`);
    const date =
      typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date) ? t.date : today();
    return {
      id: typeof t.id === 'string' ? t.id : `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
      text: t.text,
      done: t.done === true,
      date,
      createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(),
      completedAt: typeof t.completedAt === 'string' ? t.completedAt : null,
    };
  });
}

export function importBackup(file: File): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(parseBackup(String(reader.result)));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));
    reader.readAsText(file);
  });
}
