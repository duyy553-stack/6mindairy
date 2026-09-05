import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Quote, 
  CheckCircle2, 
  Sparkles, 
  Heart, 
  Target, 
  Lightbulb, 
  Smile, 
  Bookmark,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyEntry, DailyQuote } from '../types';
import { getQuoteForDate, getRandomDifferentQuote, QUOTES_COLLECTION } from '../data/quotes';
import { playChime, playPageTurnSound } from '../utils/sound';
import { formatRussianFullDate, addDays } from '../utils/dateUtils';

interface DailySpreadProps {
  entry: DailyEntry;
  onUpdateEntry: (updated: DailyEntry) => void;
  onNavigateDate?: (newDate: string) => void;
  onOpenAIAnalysis?: () => void;
}

export const DailySpread: React.FC<DailySpreadProps> = ({
  entry,
  onUpdateEntry,
  onNavigateDate,
  onOpenAIAnalysis,
}) => {
  // Mobile / layout tab selector: 'all' (split book), 'morning', or 'evening'
  const [activeView, setActiveView] = useState<'all' | 'morning' | 'evening'>('all');
  const [spreadFlipClass, setSpreadFlipClass] = useState<string>('');
  const [quoteIndexOffset, setQuoteIndexOffset] = useState<number>(0);
  const [ribbonMessage, setRibbonMessage] = useState<string | null>(null);

  const handleSwitchView = (newView: 'all' | 'morning' | 'evening') => {
    if (newView === activeView) return;
    const anim = newView === 'evening' ? 'animate-page-flip-next' : 'animate-page-flip-prev';
    setSpreadFlipClass(anim);
    setActiveView(newView);
    playPageTurnSound();
  };

  // Compute daily quote
  const baseQuote = getQuoteForDate(entry.date);
  const currentQuote: DailyQuote = quoteIndexOffset === 0
    ? baseQuote
    : QUOTES_COLLECTION[(baseQuote.id - 1 + quoteIndexOffset + QUOTES_COLLECTION.length * 10) % QUOTES_COLLECTION.length];

  const handleNextQuote = () => {
    const fresh = getRandomDifferentQuote(currentQuote.id);
    const targetOffset = (fresh.id - baseQuote.id + QUOTES_COLLECTION.length) % QUOTES_COLLECTION.length;
    setQuoteIndexOffset(targetOffset === 0 ? 1 : targetOffset);
  };

  const handleRibbonClick = () => {
    playChime();
    setRibbonMessage('Шелковая закладка: страница сохранена');
    setTimeout(() => setRibbonMessage(null), 2500);
  };

  // Helper updates
  const handleMorningGratitudeChange = (index: number, val: string) => {
    const updatedGratitude: [string, string, string] = [
      entry.morning.gratitude[0] || '',
      entry.morning.gratitude[1] || '',
      entry.morning.gratitude[2] || '',
    ];
    updatedGratitude[index] = val;
    onUpdateEntry({
      ...entry,
      morning: {
        ...entry.morning,
        gratitude: updatedGratitude,
      },
    });
  };

  const handleMorningMakesGreatChange = (index: number, val: string) => {
    const updatedMakesGreat: [string, string, string] = [
      entry.morning.makesGreat[0] || '',
      entry.morning.makesGreat[1] || '',
      entry.morning.makesGreat[2] || '',
    ];
    updatedMakesGreat[index] = val;
    onUpdateEntry({
      ...entry,
      morning: {
        ...entry.morning,
        makesGreat: updatedMakesGreat,
      },
    });
  };

  const handleMorningAffirmationChange = (val: string) => {
    onUpdateEntry({
      ...entry,
      morning: {
        ...entry.morning,
        affirmation: val,
      },
    });
  };

  const handleCompleteMorning = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newStatus = !entry.morning.completed;

    if (newStatus) {
      playChime();
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D']
      });
    }

    onUpdateEntry({
      ...entry,
      morning: {
        ...entry.morning,
        completed: newStatus,
        completedAt: newStatus ? timeStr : undefined,
      },
    });
  };

  const handleEveningGoodDeedChange = (val: string) => {
    onUpdateEntry({
      ...entry,
      evening: {
        ...entry.evening,
        goodDeed: val,
      },
    });
  };

  const handleEveningImprovementChange = (val: string) => {
    onUpdateEntry({
      ...entry,
      evening: {
        ...entry.evening,
        improvement: val,
      },
    });
  };

  const handleEveningGreatMomentsChange = (index: number, val: string) => {
    const updatedMoments: [string, string, string] = [
      entry.evening.greatMoments[0] || '',
      entry.evening.greatMoments[1] || '',
      entry.evening.greatMoments[2] || '',
    ];
    updatedMoments[index] = val;
    onUpdateEntry({
      ...entry,
      evening: {
        ...entry.evening,
        greatMoments: updatedMoments,
      },
    });
  };

  const handleEveningMoodChange = (moodVal: number) => {
    onUpdateEntry({
      ...entry,
      evening: {
        ...entry.evening,
        mood: moodVal,
      },
    });
  };

  const handleCompleteEvening = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newStatus = !entry.evening.completed;

    if (newStatus) {
      playChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366F1', '#8B5CF6', '#A855F7', '#EC4899']
      });
    }

    onUpdateEntry({
      ...entry,
      evening: {
        ...entry.evening,
        completed: newStatus,
        completedAt: newStatus ? timeStr : undefined,
      },
    });
  };

  const moodLabels = [
    { level: 1, emoji: '😔', label: 'Тяжелый' },
    { level: 2, emoji: '😐', label: 'Непростой' },
    { level: 3, emoji: '🙂', label: 'Обычный' },
    { level: 4, emoji: '😊', label: 'Хороший' },
    { level: 5, emoji: '✨', label: 'Прекрасный!' },
  ];

  return (
    <div id="daily-spread-container" className="w-full max-w-6xl mx-auto space-y-6">
      {/* Real Paper Ex-Libris Thought of the Day Card */}
      <div 
        id="quote-card" 
        className="relative bg-[#FFFDF9] dark:bg-[#1E1B17] border border-[#E6DDD0] dark:border-[#383127] rounded-3xl p-6 sm:p-7 shadow-sm overflow-hidden book-stacked-edges transition-colors"
      >
        {/* Subtle decorative inner frame */}
        <div className="border border-[#EFE7DA] dark:border-[#332D25] rounded-2xl p-5 sm:p-6 bg-[#FAF7F0]/60 dark:bg-[#25211D]/80 relative transition-colors">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#7C8363] dark:text-[#B4BE82] font-serif font-bold">
                ❦ Мысль дня
              </span>
              {currentQuote.tag && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EFE8DC] dark:bg-[#2B251E] text-[#6B7F5E] dark:text-[#B4BE82] font-serif border border-[#DCD1C0] dark:border-[#3E362C]">
                  {currentQuote.tag}
                </span>
              )}
            </div>

            <button
              id="next-quote-btn"
              onClick={handleNextQuote}
              className="text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] p-1.5 px-2.5 rounded-xl hover:bg-[#EFE8DC] dark:hover:bg-[#2A241E] transition-colors text-xs flex items-center gap-1.5 border border-[#E6DDD0] dark:border-[#383127] bg-[#FAF8F3] dark:bg-[#25211D] shadow-2xs"
              title="Показать другую мудрую мысль"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#7C8363] dark:text-[#B4BE82]" />
              <span className="text-[11px] font-serif font-medium">Другая мысль</span>
            </button>
          </div>

          <blockquote className="font-serif italic text-lg sm:text-2xl leading-relaxed text-[#2D2722] dark:text-[#EAE5D9] my-2 pl-3 border-l-2 border-[#D4A373]/50">
            «{currentQuote.text}»
          </blockquote>
          
          <div className="mt-3 flex items-center justify-between text-xs text-[#827768] dark:text-[#9C9385] font-serif">
            <cite className="not-italic font-medium text-[#4A423B] dark:text-[#D5CDC0]">
              — {currentQuote.author}
            </cite>
            <span className="text-[11px] text-[#A89F91] dark:text-[#7C7263] italic hidden sm:inline">
              Цитата #{currentQuote.id} из {QUOTES_COLLECTION.length}
            </span>
          </div>
        </div>
      </div>

      {/* View Selector for Mobile / Focus: Morning vs Evening vs Both */}
      <div className="flex items-center justify-between border-b border-[#E6DDD0] dark:border-[#2E2820] pb-3">
        <div className="flex items-center gap-1 bg-[#EFE8DC] dark:bg-[#25211D] p-1 rounded-2xl border border-[#DCD1C0] dark:border-[#383127]">
          <button
            id="view-all-btn"
            onClick={() => handleSwitchView('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-serif transition-all ${
              activeView === 'all'
                ? 'bg-[#FFFDF9] dark:bg-[#1C1916] text-[#38332E] dark:text-[#EAE5D9] font-bold shadow-2xs'
                : 'text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] font-medium'
            }`}
          >
            Книжный разворот (Утро + Вечер)
          </button>
          <button
            id="view-morning-btn"
            onClick={() => handleSwitchView('morning')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-serif flex items-center gap-1.5 transition-all ${
              activeView === 'morning'
                ? 'bg-[#E9EDC9] dark:bg-[#2B3220] text-[#4F5938] dark:text-[#D9E2A8] font-bold shadow-2xs'
                : 'text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] font-medium'
            }`}
          >
            <span>☀️</span>
            <span>Утро</span>
            {entry.morning.completed && <CheckCircle2 className="w-3.5 h-3.5 text-[#6B7F5E] dark:text-[#B4BE82]" />}
          </button>
          <button
            id="view-evening-btn"
            onClick={() => handleSwitchView('evening')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-serif flex items-center gap-1.5 transition-all ${
              activeView === 'evening'
                ? 'bg-[#FEFAE0] dark:bg-[#342718] text-[#7A5A35] dark:text-[#F3D7AB] font-bold shadow-2xs'
                : 'text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] font-medium'
            }`}
          >
            <span>🌙</span>
            <span>Вечер</span>
            {entry.evening.completed && <CheckCircle2 className="w-3.5 h-3.5 text-[#A85843] dark:text-[#E07A5F]" />}
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenAIAnalysis && (
            <button
              id="spread-ai-analyze-btn"
              onClick={onOpenAIAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFE8DC] dark:bg-[#2A241E] hover:bg-[#E5DCCF] dark:hover:bg-[#342D26] text-[#4F5938] dark:text-[#D9E2A8] text-xs font-serif font-medium border border-[#D5CABC] dark:border-[#3D352B] transition-colors shadow-2xs cursor-pointer"
              title="Прочесть между строк (ИИ Gemini 3.8 Flash)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7C8363] dark:text-[#B4BE82]" />
              <span>Читать между строк (ИИ)</span>
            </button>
          )}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#827768] dark:text-[#9C9385] font-serif uppercase tracking-widest">
            <span>•</span>
            <span>Осознанность</span>
          </div>
        </div>
      </div>

      {/* REAL PHYSICAL PAPER BOOK CASING */}
      <div className="book-cover-frame rounded-3xl p-3 sm:p-5 relative book-stacked-edges">
        {/* Silken Bookmark Ribbon (Ляссе) hanging from top */}
        <div 
          onClick={handleRibbonClick}
          className="bookmark-ribbon cursor-pointer"
          title="Шелковая закладка дня (нажмите, чтобы отметить)"
        />

        {ribbonMessage && (
          <div className="absolute top-16 right-8 bg-[#2D2722] dark:bg-[#151310] text-[#FFFDF9] dark:text-[#EAE5D9] text-xs font-serif px-3.5 py-1.5 rounded-xl shadow-lg z-30 border border-[#7C8363]/40">
            {ribbonMessage}
          </div>
        )}

        {/* OPEN BOOK DOUBLE-PAGE SPREAD WITH 3D FLIP */}
        <div 
          key={activeView} 
          className={`book-double-spread rounded-2xl overflow-hidden relative ${spreadFlipClass}`}
          onAnimationEnd={() => setSpreadFlipClass('')}
        >
          <div className={`grid ${
            activeView === 'all' 
              ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E6DDD0] dark:divide-[#2E2820]' 
              : 'grid-cols-1'
          }`}>

            {/* ================= LEFT PAGE: MORNING ROUTINE ================= */}
            {(activeView === 'all' || activeView === 'morning') && (
              <div 
                id="morning-page"
                className="p-6 sm:p-8 lg:py-10 lg:pl-10 lg:pr-16 xl:pr-20 flex flex-col justify-between relative bg-[#FFFDF9] dark:bg-[#1C1916] transition-colors"
              >
                {/* Center gutter soft crease on desktop right edge */}
                {activeView === 'all' && (
                  <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-6 pointer-events-none book-gutter-left" />
                )}

                <div className="space-y-6">
                  {/* Page Folio Header */}
                  <div className="flex items-center justify-between border-b border-[#E8DFD1] dark:border-[#2E2820] pb-4">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-[#EFE8DC] dark:bg-[#2B251E] border border-[#DCD1C0] dark:border-[#3E362C] flex items-center justify-center mr-3 text-base shadow-2xs">
                        ☀️
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-serif tracking-[0.2em] text-[#827768] dark:text-[#9C9385]">
                          Утренняя страница
                        </div>
                        <h2 className="text-xl font-serif italic text-[#2D2722] dark:text-[#EAE5D9]">
                          Практика дня
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.morning.completed && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#4F5938] dark:text-[#D9E2A8] bg-[#E9EDC9] dark:bg-[#2B3220] border border-[#CAD4AC] dark:border-[#424D31] px-2.5 py-1 rounded-xl font-serif font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#6B7F5E] dark:text-[#B4BE82]" />
                          {entry.morning.completedAt || 'Заполнено'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Folio sub-title */}
                  <div className="text-center pb-1">
                    <span className="text-[11px] font-serif italic text-[#827768] dark:text-[#9C9385] tracking-wider uppercase">
                      — Внимание, благодарность и намерение —
                    </span>
                  </div>

                  {/* SECTION 1: Gratitude (3 items with notebook ruled lines) */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <p className="text-xs uppercase tracking-wider font-serif font-bold text-[#6B7F5E] dark:text-[#B4BE82]">
                        1. Я искренне благодарен за...
                      </p>
                      <span className="text-[10px] font-serif italic text-[#A89F91] dark:text-[#7C7263]">3 радости</span>
                    </div>
                    <p className="text-[11px] text-[#827768] dark:text-[#9C9385] font-serif italic">
                      Конкретные детали, моменты или люди, согревающие ваше сердце сегодня.
                    </p>

                    <div className="space-y-3 pt-1">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="flex items-end gap-2">
                          <span className="text-xs font-serif italic text-[#827768] dark:text-[#9C9385] w-4 pb-1">
                            {idx + 1}.
                          </span>
                          <input
                            id={`morning-gratitude-${idx + 1}`}
                            type="text"
                            value={entry.morning.gratitude[idx] || ''}
                            onChange={(e) => handleMorningGratitudeChange(idx, e.target.value)}
                            placeholder={
                              idx === 0
                                ? 'Запах утреннего кофе и тишина в доме...'
                                : idx === 1
                                ? 'Глубокий восстанавливающий сон...'
                                : 'Теплое сообщение от близкого человека...'
                            }
                            className="w-full text-sm font-serif italic journal-ruled-input placeholder:text-[#A89F91]/50 dark:placeholder:text-[#7C7263]/50 text-[#2D2722] dark:text-[#EAE5D9]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 2: What makes today great (3 items) */}
                  <div className="space-y-2 pt-3">
                    <div className="flex items-baseline justify-between">
                      <p className="text-xs uppercase tracking-wider font-serif font-bold text-[#6B7F5E] dark:text-[#B4BE82]">
                        2. Что сделает этот день прекрасным...
                      </p>
                      <span className="text-[10px] font-serif italic text-[#A89F91] dark:text-[#7C7263]">3 намерения</span>
                    </div>
                    <p className="text-[11px] text-[#827768] dark:text-[#9C9385] font-serif italic">
                      Ключевые дела или душевные решения, зависящие лично от вас.
                    </p>

                    <div className="space-y-3 pt-1">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="flex items-end gap-2">
                          <span className="text-xs font-serif italic text-[#827768] dark:text-[#9C9385] w-4 pb-1">
                            {idx + 1}.
                          </span>
                          <input
                            id={`morning-makesgreat-${idx + 1}`}
                            type="text"
                            value={entry.morning.makesGreat[idx] || ''}
                            onChange={(e) => handleMorningMakesGreatChange(idx, e.target.value)}
                            placeholder={
                              idx === 0
                                ? 'Завершить важное дело с ясной головой...'
                                : idx === 1
                                ? '30 минут неспешной прогулки на свежем воздухе...'
                                : 'Быть терпеливым и внимательным к окружающим...'
                            }
                            className="w-full text-sm font-serif italic journal-ruled-input placeholder:text-[#A89F91]/50 dark:placeholder:text-[#7C7263]/50 text-[#2D2722] dark:text-[#EAE5D9]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 3: Positive Affirmation (1 item) */}
                  <div className="space-y-2 pt-3">
                    <div className="flex items-baseline justify-between">
                      <p className="text-xs uppercase tracking-wider font-serif font-bold text-[#6B7F5E] dark:text-[#B4BE82]">
                        3. Позитивная установка дня (аффирмация)
                      </p>
                      <span className="text-[10px] font-serif italic text-[#A89F91] dark:text-[#7C7263]">Я...</span>
                    </div>
                    <p className="text-[11px] text-[#827768] dark:text-[#9C9385] font-serif italic">
                      Кем и каким человеком вы сознательно выбираете быть сегодня?
                    </p>

                    <div className="flex items-end gap-2 pt-1">
                      <span className="font-serif italic text-[#6B7F5E] dark:text-[#B4BE82] text-base font-bold pb-1">
                        Я
                      </span>
                      <input
                        id="morning-affirmation"
                        type="text"
                        value={entry.morning.affirmation || ''}
                        onChange={(e) => handleMorningAffirmationChange(e.target.value)}
                        placeholder="спокоен, уверен в своих силах и открыт новым возможностям."
                        className="w-full text-sm font-serif italic journal-ruled-input placeholder:text-[#A89F91]/50 dark:placeholder:text-[#7C7263]/50 text-[#2D2722] dark:text-[#EAE5D9]"
                      />
                    </div>
                  </div>
                </div>

                {/* Left Page Bottom / Stamp Action */}
                <div className="pt-6 mt-6 border-t border-[#E8DFD1] dark:border-[#2E2820] flex items-center justify-between">
                  <span className="text-[11px] font-serif italic text-[#827768] dark:text-[#9C9385]">
                    {entry.morning.completed ? 'Утренняя страница заполнена' : 'Утренний фокус и благодарность'}
                  </span>

                  <button
                    id="complete-morning-btn"
                    onClick={handleCompleteMorning}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-serif font-medium transition-all flex items-center gap-2 shadow-2xs ${
                      entry.morning.completed
                        ? 'bg-[#E9EDC9] dark:bg-[#2B3220] text-[#4F5938] dark:text-[#D9E2A8] border border-[#CAD4AC] dark:border-[#424D31] hover:bg-[#DFE7BD] dark:hover:bg-[#353E27]'
                        : 'bg-[#7C8363] dark:bg-[#6D7456] text-white hover:bg-[#6D7456] dark:hover:bg-[#5E6548]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {entry.morning.completed ? 'Утро отмечено ✓' : 'Завершить утреннюю страницу'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ================= RIGHT PAGE: EVENING ROUTINE ================= */}
            {(activeView === 'all' || activeView === 'evening') && (
              <div 
                id="evening-page"
                className="p-6 sm:p-8 lg:py-10 lg:pl-16 xl:pl-20 lg:pr-10 flex flex-col justify-between relative bg-[#FFFDF9] dark:bg-[#1C1916] transition-colors"
              >
                {/* Center gutter soft crease on desktop left edge */}
                {activeView === 'all' && (
                  <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-6 pointer-events-none book-gutter-right" />
                )}

                <div className="space-y-6">
                  {/* Page Folio Header */}
                  <div className="flex items-center justify-between border-b border-[#E8DFD1] dark:border-[#2E2820] pb-4">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-[#FEFAE0] dark:bg-[#342718] border border-[#EBE3B8] dark:border-[#523F27] flex items-center justify-center mr-3 text-base shadow-2xs">
                        🌙
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-serif tracking-[0.2em] text-[#827768] dark:text-[#9C9385]">
                          Вечерняя страница
                        </div>
                        <h2 className="text-xl font-serif italic text-[#2D2722] dark:text-[#EAE5D9]">
                          Итоги дня
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.evening.completed && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#7A5A35] dark:text-[#F3D7AB] bg-[#FEFAE0] dark:bg-[#342718] border border-[#EAE1B8] dark:border-[#523F27] px-2.5 py-1 rounded-xl font-serif font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#A85843] dark:text-[#E07A5F]" />
                          {entry.evening.completedAt || 'Заполнено'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Folio sub-title */}
                  <div className="text-center pb-1">
                    <span className="text-[11px] font-serif italic text-[#827768] dark:text-[#9C9385] tracking-wider uppercase">
                      — Доброта, рост и вечерняя радость —
                    </span>
                  </div>

                  {/* SECTION 4: Good Deed (1 item) */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <p className="text-xs uppercase tracking-wider font-serif font-bold text-[#A85843] dark:text-[#E07A5F]">
                        1. Мой добрый поступок сегодня...
                      </p>
                      <span className="text-[10px] font-serif italic text-[#A89F91] dark:text-[#7C7263]">Забота о других</span>
                    </div>
                    <p className="text-[11px] text-[#827768] dark:text-[#9C9385] font-serif italic">
                      Что хорошего я сделал для мира? Поддержка, доброе слово, улыбка или внимание.
                    </p>

                    <div className="pt-1">
                      <input
                        id="evening-good-deed"
                        type="text"
                        value={entry.evening.goodDeed || ''}
                        onChange={(e) => handleEveningGoodDeedChange(e.target.value)}
                        placeholder="Искренне поддержал друга в сложный момент, помог коллеге..."
                        className="w-full text-sm font-serif italic journal-ruled-input placeholder:text-[#A89F91]/50 dark:placeholder:text-[#7C7263]/50 text-[#2D2722] dark:text-[#EAE5D9]"
                      />
                    </div>
                  </div>

                  {/* SECTION 5: How I will improve (1 item) */}
                  <div className="space-y-2 pt-3">
                    <div className="flex items-baseline justify-between">
                      <p className="text-xs uppercase tracking-wider font-serif font-bold text-[#A85843] dark:text-[#E07A5F]">
                        2. Как я стану лучше / Чему я научился...
                      </p>
                      <span className="text-[10px] font-serif italic text-[#A89F91] dark:text-[#7C7263]">Осознанный рост</span>
                    </div>
                    <p className="text-[11px] text-[#827768] dark:text-[#9C9385] font-serif italic">
                      Что можно было сделать иначе — без самобичевания, а с пониманием и заботой.
                    </p>

                    <div className="pt-1">
                      <input
                        id="evening-improvement"
                        type="text"
                        value={entry.evening.improvement || ''}
                        onChange={(e) => handleEveningImprovementChange(e.target.value)}
                        placeholder="В следующий раз сделаю вдох и паузу перед эмоциональным ответом..."
                        className="w-full text-sm font-serif italic journal-ruled-input placeholder:text-[#A89F91]/50 dark:placeholder:text-[#7C7263]/50 text-[#2D2722] dark:text-[#EAE5D9]"
                      />
                    </div>
                  </div>

                  {/* SECTION 6: Great moments today (3 items) */}
                  <div className="space-y-2 pt-3">
                    <div className="flex items-baseline justify-between">
                      <p className="text-xs uppercase tracking-wider font-serif font-bold text-[#A85843] dark:text-[#E07A5F]">
                        3. Прекрасные события сегодняшнего дня...
                      </p>
                      <span className="text-[10px] font-serif italic text-[#A89F91] dark:text-[#7C7263]">3 момента счастья</span>
                    </div>
                    <p className="text-[11px] text-[#827768] dark:text-[#9C9385] font-serif italic">
                      3 момента радости, открытий, тепла или маленьких личных побед.
                    </p>

                    <div className="space-y-3 pt-1">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="flex items-end gap-2">
                          <span className="text-xs font-serif italic text-[#827768] dark:text-[#9C9385] w-4 pb-1">
                            {idx + 1}.
                          </span>
                          <input
                            id={`evening-great-moment-${idx + 1}`}
                            type="text"
                            value={entry.evening.greatMoments[idx] || ''}
                            onChange={(e) => handleEveningGreatMomentsChange(idx, e.target.value)}
                            placeholder={
                              idx === 0
                                ? 'Вкусный совместный ужин с семьей...'
                                : idx === 1
                                ? 'Красивый свет заката сквозь осенние деревья...'
                                : 'Уютное чтение книги перед сном в тишине...'
                            }
                            className="w-full text-sm font-serif italic journal-ruled-input placeholder:text-[#A89F91]/50 dark:placeholder:text-[#7C7263]/50 text-[#2D2722] dark:text-[#EAE5D9]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vintage Paper Ink Stamp Mood Selector */}
                  <div className="pt-3">
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-xs uppercase tracking-wider font-serif font-bold text-[#38332E] dark:text-[#EAE5D9]">
                        Штамп настроения дня
                      </p>
                      <span className="text-[10px] font-serif italic text-[#827768] dark:text-[#9C9385]">Как прошел день</span>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {moodLabels.map((m) => {
                        const isSelected = (entry.evening.mood || 4) === m.level;
                        return (
                          <button
                            key={m.level}
                            id={`mood-level-${m.level}`}
                            type="button"
                            onClick={() => handleEveningMoodChange(m.level)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all shadow-2xs ${
                              isSelected
                                ? 'bg-[#FEFAE0] dark:bg-[#342718] border-[#A85843] dark:border-[#E07A5F] border-1.5 shadow-sm scale-102'
                                : 'bg-[#FAF8F3] dark:bg-[#25211D] border-[#E2D9CB] dark:border-[#383127] hover:bg-white dark:hover:bg-[#2C2620] hover:border-[#DCD1C0] dark:hover:border-[#4E4437]'
                            }`}
                          >
                            <span className={`text-xl transition-all ${isSelected ? 'scale-115' : 'opacity-70 hover:opacity-100'}`}>
                              {m.emoji}
                            </span>
                            <span className={`text-[10px] font-serif mt-1 truncate w-full ${
                              isSelected ? 'text-[#7A5A35] dark:text-[#F3D7AB] font-bold' : 'text-[#827768] dark:text-[#9C9385]'
                            }`}>
                              {m.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Page Bottom / Stamp Action */}
                <div className="pt-6 mt-6 border-t border-[#E8DFD1] dark:border-[#2E2820] flex items-center justify-between">
                  <span className="text-[11px] font-serif italic text-[#827768] dark:text-[#9C9385]">
                    {entry.evening.completed ? 'Вечерняя страница заполнена' : 'Вечерний итог и благодарность'}
                  </span>

                  <button
                    id="complete-evening-btn"
                    onClick={handleCompleteEvening}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-serif font-medium transition-all flex items-center gap-2 shadow-2xs ${
                      entry.evening.completed
                        ? 'bg-[#FEFAE0] dark:bg-[#342718] text-[#7A5A35] dark:text-[#F3D7AB] border border-[#EAE1B8] dark:border-[#523F27] hover:bg-[#F9F4CE] dark:hover:bg-[#3E2F1D]'
                        : 'bg-[#A85843] dark:bg-[#8D4431] text-white hover:bg-[#924734] dark:hover:bg-[#793A2A]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {entry.evening.completed ? 'Вечер отмечен ✓' : 'Завершить вечернюю страницу'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Navigation: flip back and forth between days like turning pages */}
      {onNavigateDate && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#FFFDF9] dark:bg-[#1E1B17] border border-[#E6DDD0] dark:border-[#383127] rounded-3xl book-stacked-edges transition-colors">
          <button
            onClick={() => onNavigateDate(addDays(entry.date, -1))}
            className="flex items-center gap-2 px-4 py-2 text-xs font-serif font-medium text-[#38332E] dark:text-[#EAE5D9] hover:text-[#7C8363] dark:hover:text-[#B4BE82] hover:bg-[#FAF7F0] dark:hover:bg-[#25211D] rounded-2xl border border-[#E2D9CB] dark:border-[#383127] transition-colors w-full sm:w-auto justify-center shadow-2xs"
            title="Перелистнуть на вчера / предыдущий день"
          >
            <ChevronLeft className="w-4 h-4 text-[#7C8363] dark:text-[#B4BE82]" />
            <span>Предыдущий день ({formatRussianFullDate(addDays(entry.date, -1))})</span>
          </button>

          <div className="text-center text-xs text-[#827768] dark:text-[#9C9385] font-serif">
            <span className="inline-flex items-center gap-1.5 text-[#4F5938] dark:text-[#D9E2A8] bg-[#E9EDC9] dark:bg-[#2B3220] px-3.5 py-1.5 rounded-full text-xs font-serif font-medium border border-[#CAD4AC] dark:border-[#424D31]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6B7F5E] dark:text-[#B4BE82]" /> Записи автоматически сохраняются на страницах дневника
            </span>
          </div>

          <button
            onClick={() => onNavigateDate(addDays(entry.date, 1))}
            className="flex items-center gap-2 px-4 py-2 text-xs font-serif font-medium text-[#38332E] dark:text-[#EAE5D9] hover:text-[#7C8363] dark:hover:text-[#B4BE82] hover:bg-[#FAF7F0] dark:hover:bg-[#25211D] rounded-2xl border border-[#E2D9CB] dark:border-[#383127] transition-colors w-full sm:w-auto justify-center shadow-2xs"
            title="Перелистнуть на завтра / следующий день"
          >
            <span>Следующий день ({formatRussianFullDate(addDays(entry.date, 1))})</span>
            <ChevronRight className="w-4 h-4 text-[#7C8363] dark:text-[#B4BE82]" />
          </button>
        </div>
      )}
    </div>
  );
};
