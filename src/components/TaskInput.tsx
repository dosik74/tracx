import { useEffect, useRef, useState } from 'react';
import { ClipboardPaste, Send, Wand2, Loader2, CalendarDays } from 'lucide-react';
import { today, tomorrow, humanDate } from '../utils/date';
import { normalizeWithAI } from '../utils/ai';
import { useSettings } from '../hooks/useSettings';

const AUTOFIX_KEY = 'task-tracker:autofix';

interface Props {
  defaultDate: string;
  onAdd: (texts: string[], date: string) => void;
  /** Вызывается после успешного добавления задач — для перехода на страницу списка */
  onAdded?: () => void;
}

export default function TaskInput({ defaultDate, onAdd, onAdded }: Props) {
  const [value, setValue] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [processing, setProcessing] = useState(false);
  const [focused, setFocused] = useState(false);
  const aiCleanedRef = useRef(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const { settings } = useSettings();
  const [autoFix, setAutoFix] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTOFIX_KEY) !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(AUTOFIX_KEY, String(autoFix));
    } catch {
      /* игнорируем ошибки записи */
    }
  }, [autoFix]);

  async function processRaw(raw: string): Promise<string[]> {
    setProcessing(true);
    try {
      const lines = await normalizeWithAI(raw);
      aiCleanedRef.current = true;
      setValue(lines.join('\n'));
      return lines;
    } finally {
      setProcessing(false);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData('text');
    if (!text.trim()) return;
    e.preventDefault();
    if (autoFix) {
      void processRaw(text);
    } else {
      setValue(prev => (prev ? prev + '\n' + text : text));
      aiCleanedRef.current = false;
    }
  }

  const lines = value.split('\n').map(l => l.trim()).filter(Boolean);

  async function submit(): Promise<void> {
    const raw = value.trim();
    if (!raw || processing) return;
    if (!autoFix || aiCleanedRef.current) {
      if (lines.length === 0) return;
      onAdd(lines, date);
      setValue('');
      aiCleanedRef.current = false;
      onAdded?.();
      return;
    }
    const cleaned = await processRaw(raw);
    if (cleaned.length > 0) {
      onAdd(cleaned, date);
      setValue('');
      aiCleanedRef.current = false;
      onAdded?.();
    }
  }

  return (
    <div className="relative">
      {/* Свечение над панелью */}
      {settings.inputGlow && (
        <div
          aria-hidden
          className={`pointer-events-none absolute -top-10 left-1/2 h-24 w-[90%] -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-500 ${
            processing
              ? 'bg-emerald-500/20 opacity-100'
              : focused
                ? 'bg-emerald-500/15 opacity-100'
                : 'bg-zinc-700/20 opacity-60'
          }`}
        />
      )}

      <div
        className={`relative overflow-hidden rounded-2xl border backdrop-blur transition-all duration-300 ${
          focused
            ? 'border-emerald-500/50 bg-zinc-900 shadow-[0_-12px_48px_-8px_rgba(16,185,129,0.25),inset_0_1px_0_rgba(255,255,255,0.05)]'
            : 'border-zinc-700/70 bg-zinc-900/90 shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-zinc-600'
        }`}
      >
        {/* Верхняя полоска-акцент */}
        <div
          className={`h-px w-full transition-all duration-500 ${
            processing
              ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent'
              : focused
                ? 'bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent'
                : 'bg-gradient-to-r from-transparent via-zinc-600/60 to-transparent'
          }`}
        />

        <textarea
          ref={taRef}
          value={value}
          onChange={e => {
            setValue(e.target.value);
            aiCleanedRef.current = false;
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !processing) {
              e.preventDefault();
              void submit();
            }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={handlePaste}
          rows={3}
          placeholder={
            processing
              ? 'Нейросеть обрабатывает текст…'
              : 'Вставьте сообщение клиента или напишите задачу…'
          }
          className="w-full resize-none bg-transparent px-5 pt-4 text-[15px] leading-relaxed text-zinc-100 placeholder-zinc-500 outline-none"
        />

        {/* Нижняя панель инструментов */}
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/80 px-3 py-2.5">
          <button
            onClick={() => setAutoFix(v => !v)}
            disabled={processing}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              autoFix
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
            title={
              autoFix
                ? 'Авторегулировка включена: нейросеть превращает сообщения в задачи. Нажмите, чтобы выключить.'
                : 'Авторегулировка выключена. Нажмите, чтобы включить.'
            }
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            AI {autoFix ? 'вкл' : 'выкл'}
          </button>

          <div className="mx-1 h-4 w-px bg-zinc-800" />

          <CalendarDays className="h-4 w-4 shrink-0 text-zinc-500" />
          <button
            onClick={() => setDate(today())}
            className={`rounded-lg px-2 py-1.5 text-xs font-medium transition ${
              date === today() ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            Сегодня
          </button>
          <button
            onClick={() => setDate(tomorrow())}
            className={`rounded-lg px-2 py-1.5 text-xs font-medium transition ${
              date === tomorrow() ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            Завтра
          </button>
          <input
            type="date"
            value={date}
            onChange={e => e.target.value && setDate(e.target.value)}
            className="rounded-lg bg-transparent px-1 py-1 text-xs text-zinc-400 outline-none [color-scheme:dark]"
          />
          <span className="hidden text-xs text-zinc-600 sm:inline">·</span>
          <span className="hidden text-xs text-zinc-500 md:inline">{humanDate(date)}</span>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard
                  .readText()
                  .then(t => {
                    if (!t.trim()) return;
                    if (autoFix) void processRaw(t);
                    else setValue(prev => (prev ? prev + '\n' + t : t));
                  })
                  .catch(() => undefined);
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
              title="Вставить из буфера обмена"
            >
              <ClipboardPaste className="h-4 w-4" />
            </button>
            <button
              onClick={() => void submit()}
              disabled={lines.length === 0 || processing}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {processing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Добавить{lines.length > 1 ? ` · ${lines.length}` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
