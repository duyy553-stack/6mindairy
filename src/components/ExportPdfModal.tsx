import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  FileDown, 
  Printer, 
  Calendar, 
  CheckSquare, 
  Square, 
  Loader2, 
  BookOpen, 
  Sun, 
  Moon, 
  Sparkles,
  AlertCircle,
  Compass
} from 'lucide-react';
import { DailyEntry, WeeklyReflection } from '../types';
import { 
  PdfExportOptions, 
  filterEntriesForExport, 
  generatePdfFromPages 
} from '../utils/pdfGenerator';
import { formatRussianFullDate } from '../utils/dateUtils';

const WEEKLY_ROAD_QUESTIONS = [
  {
    key: 'q1' as const,
    num: '1',
    title: 'Какое решение на этой неделе я принял сам, не оглядываясь на чужое мнение?',
    subtitle: 'Мускул субъектности',
  },
  {
    key: 'q2' as const,
    num: '2',
    title: 'Где я почувствовал сопротивление — и что оно мне пыталось сказать?',
    subtitle: 'Сопротивление как вестник',
  },
  {
    key: 'q3' as const,
    num: '3',
    title: 'В какой момент я позволил себе быть несовершенным, и что я тогда ощутил?',
    subtitle: 'Право на неидеальность',
  },
  {
    key: 'q4' as const,
    num: '4',
    title: 'Что на этой неделе оказалось для меня важным, даже если это не принесло результата?',
    subtitle: 'Осмысленность вместо гонки',
  },
  {
    key: 'q5' as const,
    num: '5',
    title: 'За что я могу себя поблагодарить — без всяких условий?',
    subtitle: 'Безусловная опора',
  },
];

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: Record<string, DailyEntry>;
  reflections?: Record<string, WeeklyReflection>;
  streak?: number;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  entries,
  reflections = {},
  streak = 0,
}) => {
  const [period, setPeriod] = useState<PdfExportOptions['period']>('week');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [includeMorning, setIncludeMorning] = useState(true);
  const [includeEvening, setIncludeEvening] = useState(true);
  const [includeAiNotes, setIncludeAiNotes] = useState(true);
  const [includeWeeklyQuestions, setIncludeWeeklyQuestions] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState('');

  const printableContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const options: PdfExportOptions = {
    period,
    startDate,
    endDate,
    includeMorning,
    includeEvening,
    includeAiNotes,
    includeWeeklyQuestions,
  };

  const filteredEntries = filterEntriesForExport(entries, options);

  // Filter non-empty weekly reflections to include in the PDF
  const relevantReflections = useMemo(() => {
    if (!includeWeeklyQuestions || !reflections) return [];
    return Object.values(reflections).filter((r) => {
      return Object.values(r.answers || {}).some((ans) => (ans || '').trim().length > 0);
    });
  }, [includeWeeklyQuestions, reflections]);

  // Group entries into pages (up to 2 days per A4 page to maintain generous typography and readability)
  const entriesPerPage = 2;
  const pages: DailyEntry[][] = [];
  for (let i = 0; i < filteredEntries.length; i += entriesPerPage) {
    pages.push(filteredEntries.slice(i, i + entriesPerPage));
  }

  const totalSheetsCount = pages.length + relevantReflections.length;

  // Handle PDF generation via html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!printableContainerRef.current) return;
    if (filteredEntries.length === 0 && relevantReflections.length === 0) return;

    setIsGenerating(true);
    setProgressText('Подготовка макета страниц...');

    try {
      // Find all rendered page elements in the hidden container
      const pageElements = Array.from(
        printableContainerRef.current.querySelectorAll<HTMLElement>('.pdf-page-sheet')
      );

      if (pageElements.length === 0) {
        throw new Error('Страницы не найдены');
      }

      const dateLabel = period === 'week' 
        ? 'nedelya' 
        : period === 'month' 
          ? 'mesyats' 
          : 'zapisi';
      const filename = `dnevnik-6-minut-${dateLabel}-${new Date().toISOString().split('T')[0]}.pdf`;

      await generatePdfFromPages(pageElements, filename, (curr, total) => {
        setProgressText(`Формирование страницы ${curr} из ${total}...`);
      });

      onClose();
    } catch (err: any) {
      console.error('Ошибка при генерации PDF:', err);
      alert('Не удалось сформировать PDF: ' + (err?.message || 'Неизвестная ошибка'));
    } finally {
      setIsGenerating(false);
      setProgressText('');
    }
  };

  // Direct browser printing via window.print()
  const handleDirectPrint = () => {
    window.print();
  };

  const getPeriodLabel = () => {
    if (period === 'week') return 'Последние 7 дней';
    if (period === 'month') return 'Текущий месяц';
    if (period === 'prev-month') return 'Прошлый месяц';
    if (period === 'all') return 'Все сохраненные записи';
    return `С ${startDate} по ${endDate}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-[#FFFDF9] dark:bg-[#1E1B17] border border-[#E5E1D8] dark:border-[#383127] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transition-all my-8 animate-tab-flip"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EFE8DC] dark:border-[#2D2821] bg-[#FAF7F0] dark:bg-[#25211D]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E9EDC9] dark:bg-[#2B3220] text-[#4F5938] dark:text-[#D9E2A8]">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-lg sm:text-xl text-[#38332E] dark:text-[#EAE5D9]">
                Скачать записи в PDF
              </h3>
              <p className="text-xs text-[#827768] dark:text-[#A0988A] font-sans">
                Форматированный документ для печати и сохранения на память
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#827768] hover:text-[#38332E] dark:hover:text-[#EAE5D9] hover:bg-[#EFE8DC] dark:hover:bg-[#342D24] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Period Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#827768] dark:text-[#A0988A] mb-3">
              1. Выберите период
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPeriod('week')}
                className={`px-3 py-2.5 rounded-xl text-xs font-serif transition-all text-center ${
                  period === 'week'
                    ? 'bg-[#4F5938] text-white font-bold shadow-xs'
                    : 'bg-[#FAF8F3] dark:bg-[#25211D] text-[#554C40] dark:text-[#C7BFB1] border border-[#E5E1D8] dark:border-[#383127] hover:border-[#4F5938]'
                }`}
              >
                Неделя (7 дней)
              </button>
              <button
                type="button"
                onClick={() => setPeriod('month')}
                className={`px-3 py-2.5 rounded-xl text-xs font-serif transition-all text-center ${
                  period === 'month'
                    ? 'bg-[#4F5938] text-white font-bold shadow-xs'
                    : 'bg-[#FAF8F3] dark:bg-[#25211D] text-[#554C40] dark:text-[#C7BFB1] border border-[#E5E1D8] dark:border-[#383127] hover:border-[#4F5938]'
                }`}
              >
                Этот месяц
              </button>
              <button
                type="button"
                onClick={() => setPeriod('prev-month')}
                className={`px-3 py-2.5 rounded-xl text-xs font-serif transition-all text-center ${
                  period === 'prev-month'
                    ? 'bg-[#4F5938] text-white font-bold shadow-xs'
                    : 'bg-[#FAF8F3] dark:bg-[#25211D] text-[#554C40] dark:text-[#C7BFB1] border border-[#E5E1D8] dark:border-[#383127] hover:border-[#4F5938]'
                }`}
              >
                Прошлый месяц
              </button>
              <button
                type="button"
                onClick={() => setPeriod('all')}
                className={`px-3 py-2.5 rounded-xl text-xs font-serif transition-all text-center ${
                  period === 'all'
                    ? 'bg-[#4F5938] text-white font-bold shadow-xs'
                    : 'bg-[#FAF8F3] dark:bg-[#25211D] text-[#554C40] dark:text-[#C7BFB1] border border-[#E5E1D8] dark:border-[#383127] hover:border-[#4F5938]'
                }`}
              >
                Все записи
              </button>
            </div>

            {/* Custom Dates toggle */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setPeriod('custom')}
                className={`text-xs font-serif italic underline hover:text-[#4F5938] transition-colors ${
                  period === 'custom' ? 'text-[#4F5938] dark:text-[#D9E2A8] font-bold' : 'text-[#827768] dark:text-[#A0988A]'
                }`}
              >
                {period === 'custom' ? '✓ Произвольный интервал выбран' : 'Или указать произвольные даты...'}
              </button>

              {period === 'custom' && (
                <div className="flex flex-wrap items-center gap-3 mt-2.5 p-3 rounded-2xl bg-[#FAF8F3] dark:bg-[#25211D] border border-[#E5E1D8] dark:border-[#383127]">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#827768]">С:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1B17] border border-[#DCD1C0] dark:border-[#3D352A] text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#827768]">По:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1B17] border border-[#DCD1C0] dark:border-[#3D352A] text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Options: What to include */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#827768] dark:text-[#A0988A] mb-3">
              2. Что включить в распечатку
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-serif">
              <button
                type="button"
                onClick={() => setIncludeMorning(!includeMorning)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF8F3] dark:bg-[#25211D] border border-[#E5E1D8] dark:border-[#383127] text-left hover:border-[#4F5938] transition-colors"
              >
                {includeMorning ? (
                  <CheckSquare className="w-4 h-4 text-[#4F5938] dark:text-[#D9E2A8]" />
                ) : (
                  <Square className="w-4 h-4 text-[#827768]" />
                )}
                <div>
                  <span className="font-bold text-[#38332E] dark:text-[#EAE5D9]">Утренние страницы</span>
                  <p className="text-[11px] text-[#827768]">Благодарности, шаги устойчивости, опорная мысль</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIncludeEvening(!includeEvening)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF8F3] dark:bg-[#25211D] border border-[#E5E1D8] dark:border-[#383127] text-left hover:border-[#4F5938] transition-colors"
              >
                {includeEvening ? (
                  <CheckSquare className="w-4 h-4 text-[#4F5938] dark:text-[#D9E2A8]" />
                ) : (
                  <Square className="w-4 h-4 text-[#827768]" />
                )}
                <div>
                  <span className="font-bold text-[#38332E] dark:text-[#EAE5D9]">Вечерние страницы</span>
                  <p className="text-[11px] text-[#827768]">Важное для себя, инсайты, значимые моменты</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIncludeAiNotes(!includeAiNotes)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF8F3] dark:bg-[#25211D] border border-[#E5E1D8] dark:border-[#383127] text-left hover:border-[#4F5938] transition-colors"
              >
                {includeAiNotes ? (
                  <CheckSquare className="w-4 h-4 text-[#4F5938] dark:text-[#D9E2A8]" />
                ) : (
                  <Square className="w-4 h-4 text-[#827768]" />
                )}
                <div>
                  <span className="font-bold text-[#38332E] dark:text-[#EAE5D9]">Анализ ИИ (если есть)</span>
                  <p className="text-[11px] text-[#827768]">Блок «Читать между строк»</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIncludeWeeklyQuestions(!includeWeeklyQuestions)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF8F3] dark:bg-[#25211D] border border-[#E5E1D8] dark:border-[#383127] text-left hover:border-[#4F5938] transition-colors"
              >
                {includeWeeklyQuestions ? (
                  <CheckSquare className="w-4 h-4 text-[#4F5938] dark:text-[#D9E2A8]" />
                ) : (
                  <Square className="w-4 h-4 text-[#827768]" />
                )}
                <div>
                  <span className="font-bold text-[#38332E] dark:text-[#EAE5D9]">Итоги недели (карта местности)</span>
                  <p className="text-[11px] text-[#827768]">5 дорожных вопросов осознанности</p>
                </div>
              </button>
            </div>
          </div>

          {/* Summary Status Box */}
          <div className="p-4 rounded-2xl bg-[#EFE8DC] dark:bg-[#2B2620] border border-[#DCD1C0] dark:border-[#3D352A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[#4F5938] dark:text-[#D9E2A8]" />
              <div>
                <p className="text-xs font-serif font-bold text-[#38332E] dark:text-[#EAE5D9]">
                  Найдено записей: {filteredEntries.length} {filteredEntries.length === 1 ? 'день' : 'дней'}
                  {includeWeeklyQuestions && relevantReflections.length > 0 && ` • ${relevantReflections.length} нед. итогов`}
                </p>
                <p className="text-[11px] text-[#827768] dark:text-[#A0988A]">
                  Период: {getPeriodLabel()} • Примерный объем: {Math.max(1, totalSheetsCount)} стр. A4
                </p>
              </div>
            </div>
            {streak > 0 && (
              <span className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-white/60 dark:bg-black/30 text-[#4F5938] dark:text-[#D9E2A8] font-semibold">
                Серия: {streak} дн.
              </span>
            )}
          </div>

          {filteredEntries.length === 0 && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>За выбранный период еще нет сохраненных записей. Выберите другой период или вариант «Все записи».</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#EFE8DC] dark:border-[#2D2821] bg-[#FAF7F0] dark:bg-[#25211D] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDirectPrint}
            disabled={filteredEntries.length === 0 || isGenerating}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#DCD1C0] dark:border-[#3D352A] text-xs font-serif text-[#38332E] dark:text-[#EAE5D9] hover:bg-white dark:hover:bg-[#1E1B17] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Печать на принтере</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl text-xs font-serif text-[#827768] dark:text-[#A0988A] hover:bg-[#EFE8DC] dark:hover:bg-[#342D24] transition-colors"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={filteredEntries.length === 0 || isGenerating}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-[#4F5938] hover:bg-[#3D452B] text-white text-xs font-serif font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progressText || 'Создание PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Скачать PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* HIDDEN PRINTABLE CONTAINER FOR PDF GENERATION (Rendered at exact A4 proportion 794x1123px) */}
      <div 
        ref={printableContainerRef}
        className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none"
        style={{ width: '794px' }}
      >
        {pages.map((pageEntries, pageIndex) => (
          <div
            key={`pdf-sheet-${pageIndex}`}
            className="pdf-page-sheet bg-[#FFFFFF] text-[#2D2821] p-10 font-serif flex flex-col justify-between"
            style={{
              width: '794px',
              minHeight: '1120px',
              boxSizing: 'border-box',
              pageBreakAfter: 'always',
            }}
          >
            {/* Top Sheet Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#2D2821] mb-6">
                <div>
                  <h1 className="text-xl font-bold tracking-tight uppercase font-serif">
                    Дневник 6 минут
                  </h1>
                  <p className="text-[11px] text-[#6B5E50] tracking-wide">
                    Личный архив практик осознанности и благодарности
                  </p>
                </div>
                <div className="text-right text-[11px] text-[#6B5E50]">
                  <p className="font-semibold text-[#2D2821]">{getPeriodLabel()}</p>
                  <p>Страница {pageIndex + 1} из {pages.length}</p>
                </div>
              </div>

              {/* Entries on this page */}
              <div className="space-y-6">
                {pageEntries.map((entry) => {
                  const morningList = entry.morning?.gratitude?.filter(Boolean) || [];
                  const goalsList = entry.morning?.makesGreat?.filter(Boolean) || [];
                  const eveningMoments = entry.evening?.greatMoments?.filter(Boolean) || [];

                  return (
                    <div 
                      key={entry.date} 
                      className="border border-[#DCD1C0] rounded-xl p-5 bg-[#FAF8F3] space-y-4"
                    >
                      {/* Date bar */}
                      <div className="flex items-center justify-between border-b border-[#E6DDD0] pb-2">
                        <h2 className="text-base font-bold italic text-[#2D2821]">
                          {formatRussianFullDate(entry.date)}
                        </h2>
                        {entry.evening?.mood && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EAE2D5] font-sans font-medium">
                            Настроение: {entry.evening.mood} из 5
                          </span>
                        )}
                      </div>

                      {/* Morning section */}
                      {includeMorning && (morningList.length > 0 || goalsList.length > 0 || entry.morning?.affirmation) && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold uppercase tracking-wider text-[#4F5938] flex items-center gap-1.5 border-b border-[#E6DDD0] pb-1">
                            <span>☀️ Утренний фокус</span>
                          </div>

                          {morningList.length > 0 && (
                            <div className="text-xs">
                              <span className="font-semibold text-[#4F5938]">Я благодарен за:</span>
                              <ul className="list-disc pl-5 mt-0.5 space-y-0.5 text-[#3D352A]">
                                {morningList.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {goalsList.length > 0 && (
                            <div className="text-xs">
                              <span className="font-semibold text-[#4F5938]">Шаги для устойчивости:</span>
                              <ul className="list-disc pl-5 mt-0.5 space-y-0.5 text-[#3D352A]">
                                {goalsList.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {entry.morning?.affirmation && (
                            <div className="text-xs italic bg-white p-2 rounded-lg border border-[#E6DDD0]">
                              <span className="font-semibold not-italic text-[#4F5938]">Опорная мысль:</span> «{entry.morning.affirmation.replace(/^«|»$/g, '')}»
                            </div>
                          )}
                        </div>
                      )}

                      {/* Evening section */}
                      {includeEvening && (entry.evening?.goodDeed || entry.evening?.improvement || eveningMoments.length > 0) && (
                        <div className="space-y-2 pt-2 border-t border-[#E6DDD0]">
                          <div className="text-xs font-bold uppercase tracking-wider text-[#7A5A35] flex items-center gap-1.5 border-b border-[#E6DDD0] pb-1">
                            <span>🌙 Вечерняя рефлексия</span>
                          </div>

                          {entry.evening?.goodDeed && (
                            <div className="text-xs text-[#3D352A]">
                              <span className="font-semibold text-[#7A5A35]">Важно для меня:</span> {entry.evening.goodDeed}
                            </div>
                          )}

                          {entry.evening?.improvement && (
                            <div className="text-xs text-[#3D352A]">
                              <span className="font-semibold text-[#7A5A35]">Что понял о себе:</span> {entry.evening.improvement}
                            </div>
                          )}

                          {eveningMoments.length > 0 && (
                            <div className="text-xs">
                              <span className="font-semibold text-[#7A5A35]">Значимое за день / Спасибо себе:</span>
                              <ul className="list-disc pl-5 mt-0.5 space-y-0.5 text-[#3D352A]">
                                {eveningMoments.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Analysis note if present */}
                      {includeAiNotes && (entry.aiAnalysis || localStorage.getItem(`analysis_${entry.date}`) || entry.notes) && (
                        <div className="p-3 rounded-lg bg-white border border-[#E0D8CB] text-xs space-y-1">
                          <span className="font-bold text-[#4F5938] flex items-center gap-1">
                            ✨ Разбор между строк (ИИ):
                          </span>
                          <p className="text-[#4A4135] text-[11px] leading-relaxed line-clamp-4 italic">
                            {entry.aiAnalysis || localStorage.getItem(`analysis_${entry.date}`) || entry.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Sheet Footer */}
            <div className="pt-4 border-t border-[#DCD1C0] flex items-center justify-between text-[10px] text-[#827768]">
              <span>Печатный выпуск «Дневник 6 минут»</span>
              <span>«Сопротивление — не враг, а сторож. Мы учимся замечать дорогу, а не судить себя»</span>
              <span>Лист {pageIndex + 1} из {totalSheetsCount}</span>
            </div>
          </div>
        ))}

        {/* Weekly Reflection Sheets */}
        {includeWeeklyQuestions && relevantReflections.map((refl, rIdx) => {
          const sheetNum = pages.length + rIdx + 1;
          return (
            <div
              key={`weekly-sheet-${refl.weekId}`}
              className="pdf-page-sheet bg-[#FFFFFF] text-[#2D2821] p-10 font-serif flex flex-col justify-between"
              style={{
                width: '794px',
                minHeight: '1120px',
                boxSizing: 'border-box',
                pageBreakAfter: 'always',
              }}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b-2 border-[#2D2821] mb-6">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight uppercase font-serif flex items-center gap-2">
                      <Compass className="w-5 h-5 text-[#4F5938]" />
                      <span>Итоги недели • Карта местности</span>
                    </h1>
                    <p className="text-[11px] text-[#6B5E50] tracking-wide mt-0.5">
                      Пять дорожных вопросов осознанности без суда и внешних оценок
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-[#6B5E50]">
                    <p className="font-semibold text-[#2D2821]">Неделя {refl.weekNumber} • {refl.year} год</p>
                    <p>Страница {sheetNum} из {totalSheetsCount}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {WEEKLY_ROAD_QUESTIONS.map((q) => {
                    const ans = refl.answers[q.key];
                    if (!ans || !ans.trim()) return null;
                    return (
                      <div key={q.key} className="border border-[#DCD1C0] rounded-xl p-4 bg-[#FAF8F3] space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-xs font-bold text-[#4F5938]">
                            {q.num}. {q.title}
                          </p>
                          <span className="text-[10px] italic text-[#827768] shrink-0">
                            {q.subtitle}
                          </span>
                        </div>
                        <p className="text-xs italic text-[#2D2722] bg-white p-2.5 rounded-lg border border-[#E6DDD0] leading-relaxed whitespace-pre-line">
                          {ans}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Sheet Footer */}
              <div className="pt-4 border-t border-[#DCD1C0] flex items-center justify-between text-[10px] text-[#827768]">
                <span>Печатный выпуск «Дневник 6 минут»</span>
                <span>«Сопротивление — не враг, а сторож. Мы учимся замечать дорогу, а не судить себя»</span>
                <span>Лист {sheetNum} из {totalSheetsCount}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
