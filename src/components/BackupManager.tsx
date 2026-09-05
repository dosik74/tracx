import { useRef, useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, DatabaseBackup } from 'lucide-react';
import type { Task } from '../types';
import { exportBackup, importBackup } from '../utils/backup';

interface Props {
  tasks: Task[];
  onImport: (tasks: Task[]) => void;
}

export default function BackupManager({ tasks, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const imported = await importBackup(file);
      if (
        window.confirm(
          `Найдено задач в файле: ${imported.length}.\nТекущие данные будут заменены. Продолжить?`
        )
      ) {
        onImport(imported);
        setMessage({ ok: true, text: `Восстановлено ${imported.length} задач.` });
      }
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : 'Неизвестная ошибка импорта.',
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-col gap-2 rounded-2xl border border-zinc-800/70 bg-zinc-900/40 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:py-2.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
          <DatabaseBackup className="h-4 w-4" /> Резервное копирование
        </span>
        <div className="flex gap-2">
        <button
          onClick={() => exportBackup(tasks)}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-emerald-500/50 hover:text-emerald-400 active:scale-95 sm:flex-none"
        >
          <Download className="h-3.5 w-3.5" /> Скачать JSON
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200 active:scale-95 sm:flex-none"
        >
          <Upload className="h-3.5 w-3.5" /> Загрузить JSON
        </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFile}
          className="hidden"
        />
        {message && (
          <span
            className={`ml-auto flex items-center gap-1.5 text-xs ${
              message.ok ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {message.ok ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            )}
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
