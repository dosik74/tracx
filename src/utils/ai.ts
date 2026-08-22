import { GROQ_API_KEY, GROQ_MODEL, GROQ_URL } from '../config';
import { normalizeMessage } from './normalize';

export const AI_SYSTEM_PROMPT = `Ты — фильтр задач для трекера задач. Пользователь вставляет сырые сообщения клиентов (часто из мессенджеров: WhatsApp, Telegram). Твоя работа — превратить текст в чистый список задач.

Верни СТРОГО JSON вида {"tasks": ["задача 1", "задача 2"]} без markdown и пояснений.

Правила:
1. Каждая отдельная просьба или действие — отдельная строка задачи.
2. Удаляй полностью: приветствия (привет, здравствуйте, добрый день), благодарности, прощания, эмодзи, обсуждения погоды и прочий мусор переписки.
3. Переформулируй каждую задачу кратко и по делу: «Позвонить клиенту», «Купить краску», а не «ну типа надо бы позвонить там клиенту этому».
4. Уточнения приклеивай к задаче в скобках: «купить краску» + «срочно» + «до пятницы» → «Купить краску (срочно, до пятницы)».
5. Числа и количества сохраняй: «3 штуки краски».
6. Полные дубликаты удаляй.
7. Все задачи пиши на русском языке.
8. Если во входном тексте нет ни одной задачи, верни {"tasks": []}.
9. Не выдумывай задачи, которых нет в тексте.`;

/** Нормализация текста нейросетью. При любой ошибке — откат на локальные эвристики. */
export async function normalizeWithAI(text: string): Promise<string[]> {
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) throw new Error(`Groq API ${res.status}`);

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(content);
    if (!parsed || !Array.isArray(parsed.tasks)) throw new Error('Некорректный ответ модели');

    return parsed.tasks.filter((t: unknown): t is string => typeof t === 'string' && t.trim().length > 0);
  } catch (err) {
    console.error('AI-нормализация недоступна, используется локальный режим:', err);
    return normalizeMessage(text);
  }
}
