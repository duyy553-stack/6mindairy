import React from 'react';
import { HelpCircle, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Compass } from 'lucide-react';
import { WeeklyReflection } from '../types';
import { getWeekDetails, addDays } from '../utils/dateUtils';
import { playChime } from '../utils/sound';
import confetti from 'canvas-confetti';

interface WeeklyQuestionsViewProps {
  currentDateKey: string;
  reflections: Record<string, WeeklyReflection>;
  onUpdateReflection: (weekId: string, updated: WeeklyReflection) => void;
  onNavigateDate: (newDateKey: string) => void;
}

export const WeeklyQuestionsView: React.FC<WeeklyQuestionsViewProps> = ({
  currentDateKey,
  reflections,
  onUpdateReflection,
  onNavigateDate,
}) => {
  const { weekId, year, weekNumber } = getWeekDetails(currentDateKey);

  const currentReflection: WeeklyReflection = reflections[weekId] || {
    weekId,
    year,
    weekNumber,
    answers: {
      q1: '',
      q2: '',
      q3: '',
      q4: '',
      q5: '',
    },
    completed: false,
    updatedAt: new Date().toISOString(),
  };

  const handleAnswerChange = (key: 'q1' | 'q2' | 'q3' | 'q4' | 'q5', val: string) => {
    onUpdateReflection(weekId, {
      ...currentReflection,
      answers: {
        ...currentReflection.answers,
        [key]: val,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleComplete = () => {
    const nextState = !currentReflection.completed;
    if (nextState) {
      playChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#7C8363', '#A85843', '#D4A373', '#E9EDC9']
      });
    }

    onUpdateReflection(weekId, {
      ...currentReflection,
      completed: nextState,
      updatedAt: new Date().toISOString(),
    });
  };

  // 5 Road questions: Week as a map of terrain, not a report card
  const questions = [
    {
      key: 'q1' as const,
      num: '1',
      title: 'Какое решение на этой неделе я принял сам, не оглядываясь на чужое мнение?',
      subtitle: 'Мускул субъектности',
      hint: 'Не важно, насколько «удачное» было решение — важно, что это был ваш выбор, а не чужая инструкция.',
      placeholder: 'На этой неделе моим самостоятельным решением было...',
    },
    {
      key: 'q2' as const,
      num: '2',
      title: 'Где я почувствовал сопротивление — и что оно мне пыталось сказать?',
      subtitle: 'Сопротивление как вестник',
      hint: 'Вместо того чтобы ругать себя за прокрастинацию или ступор, вы слушаете его как вестника. Сопротивление — это не враг, а старый сторож, который ещё не понял, что вы теперь сами решаете, куда идти.',
      placeholder: 'Я почувствовал сопротивление в..., и оно пыталось сказать мне, что...',
    },
    {
      key: 'q3' as const,
      num: '3',
      title: 'В какой момент я позволил себе быть несовершенным, и что я тогда ощутил?',
      subtitle: 'Право на неидеальность',
      hint: 'Заметьте, где вы дали себе право на ошибку или несовершенство без катастрофы. Как откликнулись мысли и ощущения, когда спало требование соответствовать?',
      placeholder: 'Я позволил себе быть неидеальным в..., и в тот момент я ощутил...',
    },
    {
      key: 'q4' as const,
      num: '4',
      title: 'Что на этой неделе оказалось для меня важным, даже если это не принесло результата?',
      subtitle: 'Осмысленность вместо гонки',
      hint: 'Возможно, случился разговор, который изменил настройку, идея, которую вы записали, или внутренний выбор. Это смещает фокус с формальных достижений на живой смысл.',
      placeholder: 'Для меня оказалось по-настоящему важным и ценным...',
    },
    {
      key: 'q5' as const,
      num: '5',
      title: 'За что я могу себя поблагодарить — без всяких условий?',
      subtitle: 'Безусловная опора',
      hint: 'Не «за успехи», а за то, что вы вообще остаётесь с собой, задаёте честные вопросы, не убегаете. Это признание своей собственной устойчивости, которая уже есть.',
      placeholder: 'Я благодарю себя без всяких условий за то, что...',
    },
  ];

  return (
    <div id="weekly-reflection-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header and Week Switcher in Real Paper Style */}
      <div className="book-cover-frame rounded-3xl p-3 sm:p-5 book-stacked-edges">
        <div className="book-double-spread rounded-2xl p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DFD1] dark:border-[#2E2820]">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#7C8363] dark:text-[#B4BE82] font-semibold uppercase tracking-widest mb-1.5 font-sans">
                <Compass className="w-4 h-4 text-[#7C8363] dark:text-[#B4BE82]" />
                <span>Карта местности • 5 дорожных вопросов</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif italic text-[#38332E] dark:text-[#EAE5D9]">
                5 вопросов недели
              </h2>
              <p className="text-xs text-[#827768] dark:text-[#9C9385] mt-1 font-serif italic max-w-xl leading-relaxed">
                Итог недели как карта местности, а не табель успеваемости. Не для суда и оценок, а чтобы заметить: где вы прошли легко, где обошли стороной, а где пришлось идти в темноте.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#F7F4EC] dark:bg-[#25211D] p-1.5 rounded-2xl border border-[#E2D9CB] dark:border-[#383127] shadow-2xs">
              <button
                onClick={() => onNavigateDate(addDays(currentDateKey, -7))}
                className="p-1.5 rounded-xl text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] hover:bg-white dark:hover:bg-[#1E1B17] transition-colors"
                title="Предыдущая неделя"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-serif font-medium px-3 text-[#38332E] dark:text-[#EAE5D9] whitespace-nowrap">
                Неделя {weekNumber} • {year} год
              </span>
              <button
                onClick={() => onNavigateDate(addDays(currentDateKey, 7))}
                className="p-1.5 rounded-xl text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] hover:bg-white dark:hover:bg-[#1E1B17] transition-colors"
                title="Следующая неделя"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Paper Notebook Ruled Questions List */}
          <div className="space-y-8 pt-6">
            {questions.map((q) => (
              <div key={q.key} className="space-y-3 pb-6 border-b border-[#EFE8DC] dark:border-[#2D2720] last:border-none last:pb-0">
                <div className="flex items-start gap-3.5">
                  <span className="w-8 h-8 rounded-full bg-[#EFE8DC] dark:bg-[#2B251E] border border-[#DCD1C0] dark:border-[#3E362C] text-[#6B7F5E] dark:text-[#B4BE82] font-serif italic text-sm font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {q.num}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="font-serif italic text-lg sm:text-xl text-[#38332E] dark:text-[#EAE5D9] block">
                        {q.title}
                      </label>
                      <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-[#F3ECE1] dark:bg-[#2A241E] text-[#7A6E5F] dark:text-[#B5A896] border border-[#E5DCD0] dark:border-[#3E362C]">
                        {q.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-[#827768] dark:text-[#9C9385] mt-1 font-serif leading-relaxed">
                      {q.hint}
                    </p>
                  </div>
                </div>

                <div className="pl-0 sm:pl-11">
                  <textarea
                    id={`weekly-${q.key}`}
                    rows={3}
                    value={currentReflection.answers[q.key] || ''}
                    onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                    placeholder={q.placeholder}
                    className="w-full text-sm font-serif italic bg-[#FAF8F3] dark:bg-[#221E19] border border-[#E6DDD0] dark:border-[#383127] rounded-2xl p-4 text-[#2D2722] dark:text-[#EAE5D9] placeholder:text-[#A89F91]/60 dark:placeholder:text-[#7A7061]/70 focus:bg-[#FFFDF9] dark:focus:bg-[#1E1B17] focus:border-[#8C7355] dark:focus:border-[#B4BE82] focus:outline-none transition-all shadow-2xs leading-relaxed"
                  />
                </div>
              </div>
            ))}

            {/* Complete action footer */}
            <div className="pt-6 border-t border-[#E8DFD1] dark:border-[#2E2820] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#827768] dark:text-[#9C9385] flex items-center gap-2 font-serif italic text-center sm:text-left">
                <Sparkles className="w-4 h-4 text-[#7C8363] dark:text-[#B4BE82] shrink-0" />
                <span>«Сопротивление — не враг, а сторож. Мы учимся замечать дорогу, а не судить себя»</span>
              </span>

              <button
                id="complete-weekly-btn"
                onClick={handleToggleComplete}
                className={`px-6 py-2.5 rounded-2xl text-xs font-serif font-medium transition-all flex items-center gap-2 shadow-2xs ${
                  currentReflection.completed
                    ? 'bg-[#E9EDC9] dark:bg-[#2B3220] text-[#4F5938] dark:text-[#D9E2A8] border border-[#CAD4AC] dark:border-[#424D31] hover:bg-[#DFE7BD] dark:hover:bg-[#353E27]'
                    : 'bg-[#7C8363] dark:bg-[#6D7456] text-white hover:bg-[#6D7456] dark:hover:bg-[#5E6548] hover:shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {currentReflection.completed ? 'Рефлексия недели сохранена ✓' : 'Завершить рефлексию недели'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

