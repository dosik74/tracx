/** Утилиты для работы с датами на чистом Date API */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function today(): string {
  return toISODate(new Date());
}

export function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toISODate(d);
}

export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function fromISODate(iso: string): Date {
  const [y, m, day] = iso.split('-').map(Number);
  return new Date(y, m - 1, day);
}

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function monthLabel(year: number, month: number): string {
  return `${MONTHS_RU[month]} ${year}`;
}

export function weekdayShort(index: number): string {
  return WEEKDAYS_SHORT[index];
}

/** Понедельник = 0 ... Воскресенье = 6 */
export function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** Сетка календаря: массив из 42 дат (6 недель), начиная с понедельника */
export function monthGrid(year: number, month: number): string[] {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - mondayIndex(first));
  const cells: string[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(toISODate(d));
  }
  return cells;
}

export function isSameMonth(iso: string, year: number, month: number): boolean {
  const [y, m] = iso.split('-').map(Number);
  return y === year && m - 1 === month;
}

export function humanDate(iso: string): string {
  const t = today();
  if (iso === t) return 'Сегодня';
  if (iso === tomorrow()) return 'Завтра';
  if (iso === addDays(t, -1)) return 'Вчера';
  const d = fromISODate(iso);
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
}
