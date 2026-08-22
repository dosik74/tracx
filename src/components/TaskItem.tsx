import { useState } from 'react';
import { Check, Pencil, X, CalendarDays, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import type { Task } from '../types';
import { useSettings } from '../hooks/useSettings';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<Task, 'text' | 'date' | 'done'>>) => void;
  onRemove: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onUpdate, onRemove }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(task.text);
  const [date, setDate] = useState(task.date);
  const [removing, setRemoving] = useState(false);
  const { settings } = useSettings();

  function save() {
    const trimmed = text.trim();
    if (trimmed) onUpdate(task.id, { text: trimmed, date });
    setEditing(false);
  }

  function handleRemove() {
    if (settings.removeFlash) {
      setRemoving(true);
      window.setTimeout(() => onRemove(task.id), 380);
    } else {
      onRemove(task.id);
    }
  }

  const created = new Date(task.createdAt);
  const createdTime = created.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const fullStamp = `${created.toLocaleDateString('ru-RU')} в ${createdTime}`;
  const doneTime = task.completedAt
    ? new Date(task.completedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <li
      className={`group relative overflow-hidden rounded-2xl border bg-zinc-900/70 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 ${
        removing && settings.removeFlash ? 'anim-remove-out' : ''
      } ${settings.taskAppear ? 'anim-task-in' : ''} ${
        task.done
          ? 'border-emerald-500/25 bg-emerald-500/[0.04]'
          : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {/* Акцентная полоса слева */}
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1 transition-colors ${
          task.done ? 'bg-emerald-500' : 'bg-gradient-to-b from-zinc-700 to-transparent group-hover:from-emerald-500/60'
        }`}
      />

      <div className="flex items-start gap-4 pl-2">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-200 ${
            task.done
              ? 'border-emerald-500 bg-emerald-500 text-zinc-950 shadow-[0_0_16px_rgba(16,185,129,0.35)]'
              : 'border-zinc-600 hover:border-emerald-400 hover:scale-110 active:scale-95'
          }`}
          aria-label={task.done ? 'Отменить выполнение' : 'Отметить выполненной'}
        >
          {task.done && (
            <span key="done" className={`flex ${settings.checkPulse ? 'anim-check-pop' : ''}`}>
              <Check className="h-5 w-5" strokeWidth={3} />
            </span>
          )}
        </button>

        {editing ? (
          <div className="anim-tab-in min-w-0 flex-1 space-y-3">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && save()}
              autoFocus
              rows={2}
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-base text-zinc-100 outline-none focus:border-emerald-500"
            />
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={e => e.target.value && setDate(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 outline-none [color-scheme:dark] focus:border-emerald-500"
              />
              <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-800/70 px-3 py-1.5 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={e => onUpdate(task.id, { done: e.target.checked })}
                  className="h-4 w-4 accent-emerald-500"
                />
                выполнена
              </label>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={save}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-4 py-1.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/25"
                >
                  <Check className="h-4 w-4" /> Сохранить
                </button>
                <button
                  onClick={() => {
                    setText(task.text);
                    setDate(task.date);
                    setEditing(false);
                  }}
                  className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="min-w-0 flex-1">
            <p
              className={`break-words whitespace-pre-wrap text-[17px] leading-relaxed font-medium transition-all duration-300 ${
                task.done ? 'text-zinc-500 line-through decoration-emerald-500/50' : 'text-zinc-100'
              } ${task.done && settings.blurCompleted ? 'blur-sm hover:blur-none select-none' : ''}`}
            >
              {task.text}
            </p>
              <span
                className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  task.done
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-zinc-800/80 text-zinc-400'
                }`}
                title={`Поступило: ${fullStamp}`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {task.date.split('-').reverse().join('.')}
                <span className="opacity-50">·</span>
                <Clock className="h-3 w-3" />
                {createdTime}
                {task.done && doneTime && (
                  <>
                    <span className="opacity-50">·</span>
                    <CheckCircle2 className="h-3 w-3" />
                    {doneTime}
                  </>
                )}
              </span>
            </div>
            <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={() => setEditing(true)}
                className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200 active:scale-90"
                title="Редактировать"
              >
                <Pencil className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={handleRemove}
                className="rounded-xl p-2 text-zinc-500 transition hover:bg-red-500/15 hover:text-red-400 active:scale-90"
                title="Удалить"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}
