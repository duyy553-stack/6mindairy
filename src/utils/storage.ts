import { DailyEntry, Habit, WeeklyReflection } from '../types';
import { formatDateKey, addDays } from './dateUtils';

const STORAGE_KEYS = {
  ENTRIES: 'min6_diary_entries_v1',
  HABITS: 'min6_diary_habits_v1',
  REFLECTIONS: 'min6_diary_reflections_v1',
  INITIALIZED: 'min6_diary_initialized_v1',
};

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-water',
    name: 'Стакан воды после пробуждения',
    color: '#3B82F6',
    createdAt: new Date().toISOString(),
    records: {},
  },
  {
    id: 'habit-reading',
    name: '15 минут чтения книги',
    color: '#EAB308',
    createdAt: new Date().toISOString(),
    records: {},
  },
  {
    id: 'habit-walk',
    name: 'Прогулка на свежем воздухе / зарядка',
    color: '#10B981',
    createdAt: new Date().toISOString(),
    records: {},
  },
  {
    id: 'habit-screen',
    name: 'Без соцсетей за 30 минут до сна',
    color: '#8B5CF6',
    createdAt: new Date().toISOString(),
    records: {},
  }
];

export function createEmptyEntry(dateKey: string): DailyEntry {
  return {
    date: dateKey,
    morning: {
      gratitude: ['', '', ''],
      makesGreat: ['', '', ''],
      affirmation: '',
      completed: false,
    },
    evening: {
      goodDeed: '',
      improvement: '',
      greatMoments: ['', '', ''],
      mood: 4,
      completed: false,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function loadAllEntries(): Record<string, DailyEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!raw) {
      // Create initial welcoming sample entry for yesterday so user sees an example
      const entries: Record<string, DailyEntry> = {};
      const yesterdayKey = addDays(formatDateKey(new Date()), -1);
      entries[yesterdayKey] = {
        date: yesterdayKey,
        morning: {
          gratitude: [
            'Утренний ароматный кофе и тишина за окном',
            'Звонок от близкого друга с теплыми словами',
            'Возможность сегодня учиться новому и развиваться'
          ],
          makesGreat: [
            'Завершить начатый проект без спешки и стресса',
            'Выйти на 20-минутную прогулку в парк в обед',
            'Быть внимательным и терпеливым к окружающим'
          ],
          affirmation: 'Я спокоен, уверен в своих силах и открыт новым возможностям.',
          completed: true,
          completedAt: '08:15',
        },
        evening: {
          goodDeed: 'Помог коллеге разобраться со сложной задачей и искренне поблагодарил бариста',
          improvement: 'В следующий раз сделаю перерыв сразу, как почувствую усталость, а не буду терпеть',
          greatMoments: [
            'Вкусный неспешный ужин в приятной компании',
            'Красивый закат персикового цвета над городом',
            'Ощущение завершенности и удовлетворения от сделанных дел'
          ],
          mood: 5,
          completed: true,
          completedAt: '22:10',
        },
        updatedAt: new Date().toISOString(),
      };
      saveAllEntries(entries);
      return entries;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load entries from localStorage', e);
    return {};
  }
}

export function saveAllEntries(entries: Record<string, DailyEntry>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save entries to localStorage', e);
  }
}

export function loadEntry(dateKey: string): DailyEntry {
  const all = loadAllEntries();
  if (all[dateKey]) {
    return all[dateKey];
  }
  return createEmptyEntry(dateKey);
}

export function saveEntry(entry: DailyEntry): void {
  const all = loadAllEntries();
  all[entry.date] = {
    ...entry,
    updatedAt: new Date().toISOString(),
  };
  saveAllEntries(all);
}

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      saveHabits(DEFAULT_HABITS);
      return DEFAULT_HABITS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load habits', e);
    return DEFAULT_HABITS;
  }
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits', e);
  }
}

export function loadReflections(): Record<string, WeeklyReflection> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load reflections', e);
    return {};
  }
}

export function saveReflections(reflections: Record<string, WeeklyReflection>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
  } catch (e) {
    console.error('Failed to save reflections', e);
  }
}

export function calculateStreak(entries: Record<string, DailyEntry>): number {
  let streak = 0;
  const today = formatDateKey(new Date());
  let currentKey = today;

  // If today is not filled yet, check if yesterday was filled to preserve current streak
  const todayEntry = entries[today];
  const todayDone = todayEntry && (todayEntry.morning.completed || todayEntry.evening.completed);

  if (!todayDone) {
    currentKey = addDays(today, -1);
  }

  while (true) {
    const entry = entries[currentKey];
    if (entry && (entry.morning.completed || entry.evening.completed)) {
      streak++;
      currentKey = addDays(currentKey, -1);
    } else {
      break;
    }
  }

  return streak;
}

export function exportBackupJSON(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    entries: loadAllEntries(),
    habits: loadHabits(),
    reflections: loadReflections(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.entries) {
      saveAllEntries(data.entries);
    }
    if (data.habits) {
      saveHabits(data.habits);
    }
    if (data.reflections) {
      saveReflections(data.reflections);
    }
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}
