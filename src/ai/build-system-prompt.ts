import { SYSTEM_PROMPT } from './system-prompt';

// Москва — UTC+3, без перехода на летнее время
const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;
const STUDIO_START_DATE = new Date(Date.UTC(2026, 8, 1)); // месяц 8 = сентябрь

const WEEKDAYS_RU = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
];

const MONTHS_RU = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

function toMskDate(now: Date): Date {
  return new Date(now.getTime() + MSK_OFFSET_MS);
}

function startOfMskDay(mskNow: Date): Date {
  return new Date(
    Date.UTC(
      mskNow.getUTCFullYear(),
      mskNow.getUTCMonth(),
      mskNow.getUTCDate(),
    ),
  );
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function formatDateRu(date: Date): string {
  const weekday = WEEKDAYS_RU[date.getUTCDay()];
  const day = date.getUTCDate();
  const month = MONTHS_RU[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${weekday}, ${day} ${month} ${year}`;
}

function getScheduleForWeekday(weekday: number): string | null {
  switch (weekday) {
    case 1: // понедельник
      return '«Мама и малыш» 16:50–17:20, «Ритмика» 18:20–19:00';
    case 2: // вторник
    case 4: // четверг
      return 'основные группы: 6–9 лет 19:00–20:00, 10–16 лет 18:00–19:00';
    case 3: // среда
      return '«Мама и малыш» 16:50–17:20, «Ритмика» 18:20–19:00';
    default:
      return null;
  }
}

/**
 * Возвращает системный промпт, дополненный актуальными датами.
 */
export function buildSystemPrompt(now: Date = new Date()): string {
  const mskNow = toMskDate(now);
  const today = startOfMskDay(mskNow);
  const firstAvailableDay =
    today.getTime() > STUDIO_START_DATE.getTime() ? today : STUDIO_START_DATE;
  const upcoming: string[] = [];
  for (let i = 0; i < 14; i++) {
    const date = addDays(firstAvailableDay, i);
    const schedule = getScheduleForWeekday(date.getUTCDay());
    if (schedule) {
      upcoming.push(`- ${formatDateRu(date)}: ${schedule}`);
    }
  }

  return `${SYSTEM_PROMPT}

Актуальная дата и расписание на ближайшие 14 дней:
Сегодня: ${formatDateRu(today)}.
${upcoming.join('\n')}

Правила работы с датами:
- Называй клиенту конкретную дату, а не только день недели.
- Если клиент говорит «в следующий вторник», выбирай первый вторник после текущей даты.
- Учитывай возраст ребёнка при выборе времени группы.`;
}
