import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Flame, 
  BookOpen, 
  CheckSquare, 
  HelpCircle, 
  Archive, 
  Info,
  Sun,
  Moon,
  Sparkles,
  LogIn,
  LogOut,
  User as UserIcon,
  CloudCheck
} from 'lucide-react';
import { ActiveTab } from '../types';
import { formatRussianFullDate, isToday, addDays, formatDateKey } from '../utils/dateUtils';
import { User } from '../lib/firebase';

interface HeaderProps {
  currentDateKey: string;
  activeTab: ActiveTab;
  streak: number;
  theme: 'light' | 'dark';
  currentUser: User | null;
  onToggleTheme: () => void;
  onTabChange: (tab: ActiveTab) => void;
  onDateChange: (newDateKey: string) => void;
  onOpenAbout: () => void;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onOpenAIAnalysis: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateKey,
  activeTab,
  streak,
  theme,
  currentUser,
  onToggleTheme,
  onTabChange,
  onDateChange,
  onOpenAbout,
  onGoogleSignIn,
  onSignOut,
  onOpenAIAnalysis,
}) => {
  const isCurrentDateToday = isToday(currentDateKey);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show header at the very top of the page
      if (currentScrollY <= 40) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 6) {
        // Scrolling DOWN -> hide header completely to maximize diary reading/writing space
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY && lastScrollY - currentScrollY > 6) {
        // Scrolling UP -> reveal header smoothly
        setIsHeaderVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrevDay = () => {
    onDateChange(addDays(currentDateKey, -1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(currentDateKey, 1));
  };

  const handleTodayClick = () => {
    onDateChange(formatDateKey(new Date()));
  };

  return (
    <header className={`w-full bg-[#FFFDF9]/95 dark:bg-[#1A1815]/95 backdrop-blur-md border-b border-[#E6DDD0] dark:border-[#2D2821] sticky top-0 z-30 shadow-2xs transition-all duration-300 ease-in-out ${
      isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none shadow-none'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5">
        {/* Top bar: Title + Streaks + Quick Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-[#EFE8DC] dark:border-[#2B2620]">
          {/* Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#7C8363] text-[#FFFDF9] flex items-center justify-center font-serif italic font-bold text-xl shadow-xs border border-[#6D7456]">
              6
            </div>
            <div>
              <h1 className="font-serif italic text-2xl sm:text-3xl font-normal text-[#38332E] dark:text-[#EAE5D9] leading-none">
                Дневник 6 минут
              </h1>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#827768] dark:text-[#9C9385] mt-1 font-serif">
                Книга осознанности и ежедневной благодарности
              </p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
            {/* Streak Counter */}
            <div 
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E9EDC9] dark:bg-[#2B3220] border border-[#CAD4AC] dark:border-[#424D31] text-[#4F5938] dark:text-[#D9E2A8] text-xs font-serif font-semibold tracking-tight shadow-2xs"
              title="Количество дней осознанности подряд"
            >
              <Flame className="w-4 h-4 text-[#7C8363] dark:text-[#A4B56C] fill-[#7C8363]/20" />
              <span>{streak} {streak === 1 ? 'день' : streak > 1 && streak < 5 ? 'дня' : 'дней'} пути</span>
            </div>

            {/* AI Analysis Button */}
            <button
              id="header-ai-analyze-btn"
              onClick={onOpenAIAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F3] dark:bg-[#25211D] hover:bg-[#EFE8DC] dark:hover:bg-[#322C24] text-[#4F5938] dark:text-[#D9E2A8] text-xs font-serif font-semibold transition-all border border-[#D5DCB3] dark:border-[#424D31] shadow-2xs"
              title="Анализ записи: читать между строк с помощью Gemini 3.8 Flash"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7C8363] dark:text-[#B4BE82]" />
              <span>Между строк (ИИ)</span>
            </button>

            {/* Google Authentication Control */}
            {currentUser ? (
              <div className="flex items-center gap-1 bg-[#FAF8F3] dark:bg-[#25211D] border border-[#E2D9CB] dark:border-[#383127] rounded-full p-0.5 pr-2.5 shadow-2xs">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'Пользователь'} 
                    className="w-6 h-6 rounded-full object-cover border border-[#DCD1C0] dark:border-[#483F32]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#7C8363] text-white flex items-center justify-center text-[10px] font-bold">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-serif text-[#38332E] dark:text-[#EAE5D9] max-w-[100px] truncate ml-1 font-medium hidden md:inline">
                  {currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0]}
                </span>
                <span title="Синхронизировано с Google Облаком" className="text-[#6B7F5E] dark:text-[#B4BE82] ml-0.5">
                  <CloudCheck className="w-3.5 h-3.5" />
                </span>
                <button
                  id="google-logout-btn"
                  onClick={onSignOut}
                  title="Выйти из аккаунта Google"
                  className="p-1 text-[#827768] dark:text-[#9C9385] hover:text-[#B91C1C] dark:hover:text-[#F87171] transition-colors rounded-full"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                id="google-login-btn"
                onClick={onGoogleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F3] dark:bg-[#25211D] hover:bg-[#EFE8DC] dark:hover:bg-[#302B25] text-[#38332E] dark:text-[#EAE5D9] text-xs font-serif font-medium transition-colors border border-[#E2D9CB] dark:border-[#383127] shadow-2xs"
                title="Войти через Google для синхронизации дневника между устройствами"
              >
                <LogIn className="w-3.5 h-3.5 text-[#4285F4]" />
                <span className="text-xs">Вход Google</span>
              </button>
            )}

            {/* Dark / Light Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F3] dark:bg-[#25211D] hover:bg-[#EFE8DC] dark:hover:bg-[#302B25] text-[#38332E] dark:text-[#EAE5D9] text-xs font-serif font-medium transition-colors border border-[#E2D9CB] dark:border-[#383127] shadow-2xs"
              title={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему (ночной режим)'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span className="text-xs">Светлая</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#7C8363]" />
                  <span className="text-xs">Темная</span>
                </>
              )}
            </button>

            {/* About / Help */}
            <button
              id="header-about-btn"
              onClick={onOpenAbout}
              className="p-2 rounded-full text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] hover:bg-[#EFE8DC] dark:hover:bg-[#2E2924] transition-colors border border-transparent hover:border-[#E2D9CB] dark:hover:border-[#383127]"
              title="О методике и бэкап данных"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Navigation & Primary Tabs: Stacked & Centered */}
        <div className="flex flex-col items-center justify-center gap-3 pt-3 w-full">
          {/* Row 1: Date Selector (Centered above tabs) */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#FAF8F3] dark:bg-[#25211D] p-1 rounded-2xl border border-[#E2D9CB] dark:border-[#383127] shadow-2xs">
              <button
                id="prev-day-btn"
                onClick={handlePrevDay}
                className="p-1.5 rounded-xl text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] hover:bg-[#FFFDF9] dark:hover:bg-[#1E1B17] transition-colors"
                title="Предыдущий день"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 text-xs sm:text-sm font-serif text-[#38332E] dark:text-[#EAE5D9] whitespace-nowrap font-medium">
                {formatRussianFullDate(currentDateKey)}
              </div>

              <button
                id="next-day-btn"
                onClick={handleNextDay}
                className="p-1.5 rounded-xl text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] hover:bg-[#FFFDF9] dark:hover:bg-[#1E1B17] transition-colors"
                title="Следующий день"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {!isCurrentDateToday && (
              <button
                id="today-btn"
                onClick={handleTodayClick}
                className="px-3 py-1.5 rounded-xl bg-[#E9EDC9] dark:bg-[#2B3220] hover:bg-[#DFE7BD] dark:hover:bg-[#353E27] text-[#4F5938] dark:text-[#D9E2A8] text-xs font-serif font-semibold transition-colors border border-[#CAD4AC] dark:border-[#424D31] shadow-2xs"
              >
                Сегодня
              </button>
            )}

            <input
              type="date"
              value={currentDateKey}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="text-xs font-serif bg-[#FAF8F3] dark:bg-[#25211D] border border-[#E2D9CB] dark:border-[#383127] rounded-xl px-2.5 py-1.5 text-[#38332E] dark:text-[#EAE5D9] hover:border-[#7C8363] cursor-pointer shadow-2xs"
              title="Выбрать дату в календаре"
            />
          </div>

          {/* Row 2: Navigation Tabs (Centered below date) */}
          <nav className="flex items-center justify-center gap-1 bg-[#EFE8DC] dark:bg-[#25211D] p-1 rounded-2xl border border-[#DCD1C0] dark:border-[#383127] overflow-x-auto max-w-full">
            <button
              id="tab-diary"
              onClick={() => onTabChange('diary')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif transition-all whitespace-nowrap ${
                activeTab === 'diary'
                  ? 'bg-[#FFFDF9] dark:bg-[#1C1916] text-[#38332E] dark:text-[#EAE5D9] font-bold shadow-2xs'
                  : 'text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] font-medium'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#7C8363] dark:text-[#B4BE82]" />
              <span>Дневник</span>
            </button>

            <button
              id="tab-habits"
              onClick={() => onTabChange('habits')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif transition-all whitespace-nowrap ${
                activeTab === 'habits'
                  ? 'bg-[#FFFDF9] dark:bg-[#1C1916] text-[#38332E] dark:text-[#EAE5D9] font-bold shadow-2xs'
                  : 'text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] font-medium'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#7C8363] dark:text-[#B4BE82]" />
              <span>Привычки</span>
            </button>

            <button
              id="tab-weekly"
              onClick={() => onTabChange('weekly')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif transition-all whitespace-nowrap ${
                activeTab === 'weekly'
                  ? 'bg-[#FFFDF9] dark:bg-[#1C1916] text-[#38332E] dark:text-[#EAE5D9] font-bold shadow-2xs'
                  : 'text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] font-medium'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#7C8363] dark:text-[#B4BE82]" />
              <span>5 вопросов</span>
            </button>

            <button
              id="tab-archive"
              onClick={() => onTabChange('archive')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif transition-all whitespace-nowrap ${
                activeTab === 'archive'
                  ? 'bg-[#FFFDF9] dark:bg-[#1C1916] text-[#38332E] dark:text-[#EAE5D9] font-bold shadow-2xs'
                  : 'text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] font-medium'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-[#7C8363] dark:text-[#B4BE82]" />
              <span>Архив и чтение</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
