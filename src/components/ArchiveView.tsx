import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  CheckCircle2, 
  Sun, 
  Moon, 
  ArrowRight,
  BookOpen,
  FileDown
} from 'lucide-react';
import { DailyEntry, WeeklyReflection } from '../types';
import { formatDateKey, formatRussianFullDate, parseDateKey } from '../utils/dateUtils';
import { ExportPdfModal } from './ExportPdfModal';

interface ArchiveViewProps {
  entries: Record<string, DailyEntry>;
  streak: number;
  reflections?: Record<string, WeeklyReflection>;
  onSelectDate: (dateKey: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  entries,
  streak,
  reflections = {},
  onSelectDate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => new Date());
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Statistics calculation
  const allEntriesList = Object.values(entries) as DailyEntry[];
  const totalEntriesCount = allEntriesList.length;
  const completedMorningsCount = allEntriesList.filter((e) => e.morning?.completed).length;
  const completedEveningsCount = allEntriesList.filter((e) => e.evening?.completed).length;
  const completedDaysCount = allEntriesList.filter((e) => e.morning?.completed || e.evening?.completed).length;

  // Calendar logic for month display
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(year, month + 1, 1));
  };

  // Search through all entries
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      // Return recent 15 entries sorted by date desc
      return allEntriesList
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 15);
    }

    const query = searchQuery.toLowerCase();
    return allEntriesList
      .filter((e) => {
        const textParts: string[] = [
          ...e.morning.gratitude,
          ...e.morning.makesGreat,
          e.morning.affirmation,
          e.evening.goodDeed,
          e.evening.improvement,
          ...e.evening.greatMoments,
        ];
        return textParts.some((t) => t && t.toLowerCase().includes(query));
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [allEntriesList, searchQuery]);

  return (
    <div id="archive-view-container" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Archive Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="font-serif italic text-2xl sm:text-3xl text-[#38332E] dark:text-[#EAE5D9]">
            Архив и воспоминания
          </h2>
          <p className="text-xs text-[#827768] dark:text-[#A0988A] font-serif mt-0.5">
            История ваших мыслей, утренних намерений и вечерних осознаний
          </p>
        </div>
        <button
          id="download-entries-pdf-btn"
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#4F5938] hover:bg-[#3D452B] text-white text-xs font-serif font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
          title="Сгенерировать и скачать PDF с записями за неделю или месяц для печати"
        >
          <FileDown className="w-4 h-4" />
          <span>Скачать записи (PDF)</span>
        </button>
      </div>

      {/* Top Stats Overview in Bento Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFDF9] dark:bg-[#1E1B17] border border-[#E5E1D8] dark:border-[#383127] rounded-3xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-[#7C8363] dark:text-[#B4BE82] text-xs font-semibold uppercase tracking-widest mb-1.5 font-sans">
            <Flame className="w-4 h-4 text-[#7C8363] dark:text-[#B4BE82]" />
            <span>Серия дней</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif italic text-[#38332E] dark:text-[#EAE5D9]">
            {streak} {streak === 1 ? 'день' : streak > 1 && streak < 5 ? 'дня' : 'дней'}
          </div>
        </div>

        <div className="bg-[#FFFDF9] dark:bg-[#1E1B17] border border-[#E5E1D8] dark:border-[#383127] rounded-3xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-[#7C8363] dark:text-[#B4BE82] text-xs font-semibold uppercase tracking-widest mb-1.5 font-sans">
            <Sun className="w-4 h-4 text-[#7C8363] dark:text-[#B4BE82]" />
            <span>Утренних сессий</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif italic text-[#38332E] dark:text-[#EAE5D9]">
            {completedMorningsCount}
          </div>
        </div>

        <div className="bg-[#FFFDF9] dark:bg-[#1E1B17] border border-[#E5E1D8] dark:border-[#383127] rounded-3xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-[#D4A373] text-xs font-semibold uppercase tracking-widest mb-1.5 font-sans">
            <Moon className="w-4 h-4 text-[#D4A373]" />
            <span>Вечерних сессий</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif italic text-[#38332E] dark:text-[#EAE5D9]">
            {completedEveningsCount}
          </div>
        </div>

        <div className="bg-[#FFFDF9] dark:bg-[#1E1B17] border border-[#E5E1D8] dark:border-[#383127] rounded-3xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-[#7C8363] dark:text-[#B4BE82] text-xs font-semibold uppercase tracking-widest mb-1.5 font-sans">
            <BookOpen className="w-4 h-4 text-[#7C8363] dark:text-[#B4BE82]" />
            <span>Дней с записями</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif italic text-[#38332E] dark:text-[#EAE5D9]">
            {completedDaysCount}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Picker Panel */}
        <div className="lg:col-span-1 bg-[#FFFDF9] dark:bg-[#1E1B17] border border-[#E5E1D8] dark:border-[#383127] rounded-3xl p-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif italic text-[#38332E] dark:text-[#EAE5D9] text-lg">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] hover:bg-[#FAF8F3] dark:hover:bg-[#25211D] transition-colors"
                title="Предыдущий месяц"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] hover:bg-[#FAF8F3] dark:hover:bg-[#25211D] transition-colors"
                title="Следующий месяц"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Day Labels */}
          <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-wider font-sans font-semibold text-[#827768] dark:text-[#9C9385] mb-2.5">
            <span>Пн</span>
            <span>Вт</span>
            <span>Ср</span>
            <span>Чт</span>
            <span>Пт</span>
            <span>Сб</span>
            <span>Вс</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateKey = formatDateKey(dateObj);
              const entry = entries[dateKey];

              const morningDone = entry?.morning?.completed;
              const eveningDone = entry?.evening?.completed;
              const isFilled = morningDone || eveningDone;

              return (
                <button
                  key={dateKey}
                  onClick={() => onSelectDate(dateKey)}
                  className={`h-9 rounded-xl flex flex-col items-center justify-center relative text-xs font-mono transition-all ${
                    isFilled 
                      ? 'bg-[#E9EDC9] dark:bg-[#2B3220] font-bold text-[#4F5938] dark:text-[#D9E2A8] hover:bg-[#DFE7BD] dark:hover:bg-[#353E27] shadow-2xs' 
                      : 'text-[#827768] dark:text-[#9C9385] hover:bg-[#FAF8F3] dark:hover:bg-[#25211D]'
                  }`}
                  title={formatRussianFullDate(dateKey)}
                >
                  <span>{dayNum}</span>
                  {/* Status dots */}
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {morningDone && <div className="w-1.5 h-1.5 rounded-full bg-[#7C8363] dark:bg-[#A4B56C]" />}
                    {eveningDone && <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-[#EFE8DC] dark:border-[#2E2820] flex items-center justify-center gap-4 text-[11px] text-[#827768] dark:text-[#9C9385]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#7C8363] dark:bg-[#A4B56C] inline-block" />
              Утро
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#D4A373] inline-block" />
              Вечер
            </span>
          </div>
        </div>

        {/* Search & Entry History List */}
        <div className="lg:col-span-2 bg-[#FFFDF9] dark:bg-[#1E1B17] border border-[#E5E1D8] dark:border-[#383127] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col transition-colors">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#827768] dark:text-[#9C9385] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по воспоминаниям, благодарностям и событиям..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#FAF8F3] dark:bg-[#25211D] border border-[#E5E1D8] dark:border-[#383127] rounded-2xl text-xs sm:text-sm text-[#38332E] dark:text-[#EAE5D9] placeholder:text-[#827768]/60 dark:placeholder:text-[#9C9385]/60 focus:outline-none focus:border-[#7C8363] dark:focus:border-[#B4BE82] shadow-2xs transition-colors font-serif"
            />
          </div>

          {/* Results List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 flex-1">
            {searchResults.length === 0 ? (
              <div className="text-center py-12 text-[#827768] dark:text-[#9C9385] text-xs font-serif italic">
                {searchQuery ? 'Ничего не найдено по вашему запросу' : 'Пока нет сохраненных записей'}
              </div>
            ) : (
              searchResults.map((item) => {
                const gratitudeText = item.morning.gratitude.filter(Boolean).join(' • ');
                const greatMomentsText = item.evening.greatMoments.filter(Boolean).join(' • ');

                return (
                  <div
                    key={item.date}
                    onClick={() => onSelectDate(item.date)}
                    className="p-4 rounded-2xl bg-[#FAF8F3] dark:bg-[#25211D] border border-[#EFE8DC] dark:border-[#2E2820] hover:border-[#7C8363] dark:hover:border-[#B4BE82] hover:shadow-xs cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif italic text-base text-[#38332E] dark:text-[#EAE5D9] group-hover:text-[#7C8363] dark:group-hover:text-[#B4BE82] transition-colors">
                        {formatRussianFullDate(item.date)}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-[#827768] dark:text-[#9C9385]">
                        {item.morning.completed && (
                          <span className="flex items-center gap-1 text-[#7C8363] dark:text-[#B4BE82] font-medium">
                            <Sun className="w-3 h-3" /> Утро
                          </span>
                        )}
                        {item.evening.completed && (
                          <span className="flex items-center gap-1 text-[#D4A373] font-medium">
                            <Moon className="w-3 h-3" /> Вечер
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#7C8363] dark:text-[#B4BE82]" />
                      </div>
                    </div>

                    {gratitudeText && (
                      <p className="text-xs text-[#524B42] dark:text-[#C4BCAD] line-clamp-1 italic font-serif">
                        <span className="font-semibold text-[#7C8363] dark:text-[#B4BE82] not-italic">Благодарность:</span> {gratitudeText}
                      </p>
                    )}

                    {greatMomentsText && (
                      <p className="text-xs text-[#524B42] dark:text-[#C4BCAD] line-clamp-1 italic font-serif">
                        <span className="font-semibold text-[#D4A373] not-italic">Прекрасные события:</span> {greatMomentsText}
                      </p>
                    )}

                    {item.morning.affirmation && (
                      <p className="text-[11px] text-[#827768] dark:text-[#9C9385] italic font-serif">
                        «Я {item.morning.affirmation}»
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* PDF Export & Print Modal */}
      <ExportPdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        entries={entries}
        reflections={reflections}
        streak={streak}
      />
    </div>
  );
};
