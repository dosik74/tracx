/**
 * Авторегулировка текста: приводит сообщения клиентов к удобному формату задач.
 * Убирает эмодзи, вежливость, маркеры списков, дубликаты; приводит регистр.
 */

const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2B00}-\u{2BFF}\u{1F000}-\u{1F02F}]/gu;

/** Строки, целиком состоящие из «шума» — удаляются */
const NOISE_LINE =
  /^(привет|приветик|здравствуй(те)?|добр(ый|ое|ая)\s*(день|утро|вечер|ночь)?|хай|ку|hello|hi|hey)[\s!,.!]*$|^((большое\s+)?(спасибо\s+(заранее|заранья)|заранее\s+спасибо)|благодарю|пожалуйста|не за что|всего доброго|до связи|с уважением|хорошего дня)[\s!,.!]*$|^[\p{L}\s,.\-—!?]{0,40}:$/iu;

/** Короткие уточнения, которые приклеиваются к предыдущей задаче */
const QUALIFIER =
  /^(срочн\w*|очень важно|важно|asap|до \S+|к \d+[.\d]*(\s+\S+)?|не откладывая|\d+\s*(шт|руб|грн|₽|€|\$|кг|км|час\w*|мин|дн\w*)\.?)$/i;

/** Вежливые слова, вырезаемые внутри строки */
const NOISE_INLINE =
  /\b(пожалуйста|если можно|если вас не затруднит|будьте добры)\b[,\s]*/gi;

function cleanLine(line: string): string {
  return line
    .replace(EMOJI_RE, '')
    .replace(/^\s*(?:[-•*–—>]+|\d+[.)]|[a-zа-я][.)])\s+/i, '')
    .replace(NOISE_INLINE, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim()
    .replace(/[.!?]+$/, '');
}

function capitalize(s: string): string {
  const m = s.match(/[\p{L}]/u);
  if (!m || m.index === undefined) return s;
  return s.slice(0, m.index) + s[m.index].toUpperCase() + s.slice(m.index + 1);
}

export function normalizeMessage(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const line of raw.split('\n')) {
    const cleaned = cleanLine(line);
    if (!cleaned) continue;
    if (NOISE_LINE.test(cleaned)) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(capitalize(cleaned));
  }

  // Слияние коротких строк-уточнений с предыдущей (например, «срочно», «до пятницы»)
  const merged: string[] = [];
  for (const line of out) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      (QUALIFIER.test(line) || /^\d+\s*(шт|руб|грн|₽|€|\$|кг|км|час\w*|мин)\b/i.test(line))
    ) {
      merged[merged.length - 1] = `${prev} (${line.toLowerCase()})`;
    } else {
      merged.push(line);
    }
  }

  return merged;
}
