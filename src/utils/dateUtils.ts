export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatRussianFullDate(dateKey: string): string {
  const d = parseDateKey(dateKey);
  const weekdays = [
    'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'
  ];
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const weekday = weekdays[d.getDay()];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${weekday}, ${day} ${month} ${year}`;
}

export function formatShortDate(dateKey: string): string {
  const d = parseDateKey(dateKey);
  const monthsShort = [
    'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
  ];
  return `${d.getDate()} ${monthsShort[d.getMonth()]}`;
}

export function addDays(dateKey: string, days: number): string {
  const d = parseDateKey(dateKey);
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
}

export function isToday(dateKey: string): boolean {
  const todayKey = formatDateKey(new Date());
  return dateKey === todayKey;
}

// Get ISO week number and week identifier
export function getWeekDetails(dateKey: string): { weekId: string; year: number; weekNumber: number; weekDays: string[] } {
  const d = parseDateKey(dateKey);
  // Copy date
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = d.getFullYear();
  const weekId = `${year}-W${String(weekNumber).padStart(2, '0')}`;

  // Calculate Monday of this week
  const monday = new Date(d);
  monday.setDate(d.getDate() - dayNr);
  const weekDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    weekDays.push(formatDateKey(current));
  }

  return { weekId, year, weekNumber, weekDays };
}
