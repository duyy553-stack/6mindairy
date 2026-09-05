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

  // Deeply reworked 5 questions to provide genuine insight into personal growth and the journey traveled
  const questions = [
    {
      key: 'q1' as const,
      num: '1',
      title: 'В чем я вырос или изменился за эту неделю по сравнению с собой прежним?',
      subtitle: 'Осознание пройденного отрезка пути',
      hint: 'Оглянитесь на начало недели: с какими сомнениями, привычными реакциями или страхами вы справились? Что раньше давалось с трудом, а теперь получается спокойнее и зрелее?',
      placeholder: 'За эти 7 дней я заметил в себе рост и внутренние перемены в том, что...',
    },
    {
      key: 'q2' as const,
      num: '2',
      title: 'С какими ключевыми вызовами я встретился, и что помогло мне выстоять?',
      subtitle: 'Преодоление и внутренняя опора',
      hint: 'Трудности и неожиданности — главные учителя. Какая внутренняя ценность, поддержка близких или личная стойкость помогли вам не опустить руки и пройти сквозь напряжение?',
      placeholder: 'Главный вызов этой недели научил меня стойкости, а опорой для меня стало...',
    },
    {
      key: 'q3' as const,
      num: '3',
      title: 'Что забирало мою энергию и уводило от главного, и что пора сознательно отпустить?',
      subtitle: 'Честность с собой и освобождение',
      hint: 'Честный взгляд на свои дни. Какие пустые переживания, лишние дела, завышенные ожидания или обиды вам больше не нужны? Что вы готовы оставить позади?',
      placeholder: 'Я освобождаюсь от лишнего и перестаю растрачивать силы на...',
    },
    {
      key: 'q4' as const,
      num: '4',
      title: 'В какие моменты недели я чувствовал себя по-настоящему живым и на своем пути?',
      subtitle: 'Пульс подлинной жизни и смыслы',
      hint: 'Вспомните эпизоды искренней глубины: душевный разговор, тихая прогулка, акт бескорыстной доброты, творческий поток или момент чистой благодарности.',
      placeholder: 'Я ощутил настоящую жизнь, внутреннюю гармонию и смысл, когда...',
    },
    {
      key: 'q5' as const,
      num: '5',
      title: 'Какой один осознанный шаг на следующей неделе станет главным ориентиром моего пути?',
      subtitle: 'Вектор движения и фокус внимания',
      hint: 'Не перегружайте себя списком бытовых задач. Выберите одно ключевое намерение: куда вы бережно направите свою главную энергию, заботу и внимание?',
      placeholder: 'Мой главный осознанный фокус и намерение на новую неделю — это...',
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
                <span>Еженедельная рефлексия • Осознание пути</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif italic text-[#38332E] dark:text-[#EAE5D9]">
                5 вопросов недели
              </h2>
              <p className="text-xs text-[#827768] dark:text-[#9C9385] mt-1 font-serif italic max-w-xl">
                Воскресный привал на жизненном пути. Оглянитесь назад, чтобы увидеть свой внутренний рост, поблагодарить себя за пройденный отрезок и наметить верный ориентир.
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
                <span>«Осознание пути дарует внутренний покой и веру в свои силы»</span>
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

