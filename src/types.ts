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
  aiAnalysis?: string;
  updatedAt: string;
}

export interface WeeklyReflection {
  weekId: string; // e.g. "2026-W36"
  year: number;
  weekNumber: number;
  answers: {
    q1: string; // Какое решение на этой неделе я принял сам, не оглядываясь на чужое мнение?
    q2: string; // Где я почувствовал сопротивление — и что оно мне пыталось сказать?
    q3: string; // В какой момент я позволил себе быть несовершенным, и что я тогда ощутил?
    q4: string; // Что на этой неделе оказалось для меня важным, даже если это не принесло результата?
    q5: string; // За что я могу себя поблагодарить — без всяких условий?
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
