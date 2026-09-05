export interface MorningRoutine {
  gratitude: [string, string, string];
  makesGreat: [string, string, string];
  affirmation: string;
  completed: boolean;
  completedAt?: string;
}

export interface EveningRoutine {
  goodDeed: string;
  improvement: string;
  greatMoments: [string, string, string];
  mood: number; // 1 to 5
  completed: boolean;
  completedAt?: string;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  morning: MorningRoutine;
  evening: EveningRoutine;
  quoteId?: number;
  customQuote?: {
    text: string;
    author: string;
  };
  notes?: string;
  updatedAt: string;
}

export interface WeeklyReflection {
  weekId: string; // e.g. "2026-W36"
  year: number;
  weekNumber: number;
  answers: {
    q1: string; // За что я больше всего благодарен на этой неделе?
    q2: string; // Какой важный урок или инсайт я получил?
    q3: string; // Что вызвало у меня искреннюю радость или смех?
    q4: string; // Какая привычка принесла наибольшую пользу?
    q5: string; // С кем я хочу провести больше времени или кому выразить признательность?
  };
  completed: boolean;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  records: Record<string, boolean>; // date (YYYY-MM-DD) -> completed
}

export interface DailyQuote {
  id: number;
  text: string;
  author: string;
  tag?: string;
}

export type ActiveTab = 'diary' | 'habits' | 'weekly' | 'archive' | 'about';
