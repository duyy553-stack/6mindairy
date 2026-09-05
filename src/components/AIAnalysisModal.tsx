import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  RefreshCw, 
  Check, 
  Copy, 
  AlertCircle,
  Lightbulb,
  BrainCircuit,
  Lock
} from 'lucide-react';
import Markdown from 'react-markdown';
import { DailyEntry } from '../types';
import { formatRussianFullDate } from '../utils/dateUtils';
import { loadSavedAnalysis, saveAnalysisToFirestore } from '../utils/firestoreSync';
import { User } from '../lib/firebase';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: DailyEntry;
  currentUser: User | null;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  isOpen,
  onClose,
  entry,
  currentUser,
}) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>('gemini-3.8-flash');

  // Load existing analysis if previously generated
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const localKey = `analysis_${entry.date}`;
    const cached = localStorage.getItem(localKey);

    if (cached) {
      setAnalysis(cached);
    } else if (currentUser) {
      loadSavedAnalysis(currentUser.uid, entry.date).then((cloudAnalysis) => {
        if (isMounted && cloudAnalysis) {
          setAnalysis(cloudAnalysis);
          localStorage.setItem(localKey, cloudAnalysis);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, entry.date, currentUser]);

  if (!isOpen) return null;

  const hasContent = 
    Boolean(entry.morning?.gratitude?.some(Boolean)) ||
    Boolean(entry.morning?.makesGreat?.some(Boolean)) ||
    Boolean(entry.morning?.affirmation) ||
    Boolean(entry.evening?.goodDeed) ||
    Boolean(entry.evening?.improvement) ||
    Boolean(entry.evening?.greatMoments?.some(Boolean));

  const handleRunAnalysis = async () => {
    if (!hasContent) {
      setError('Заполните хотя бы несколько строк в дневнике за этот день, чтобы ИИ мог прочитать контекст.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при запросе к ИИ-серверу.');
      }

      setAnalysis(data.analysis);
      if (data.model) setModelName(data.model);

      const localKey = `analysis_${entry.date}`;
      localStorage.setItem(localKey, data.analysis);

      if (currentUser) {
        await saveAnalysisToFirestore(currentUser.uid, entry.date, data.analysis);
      }
    } catch (err: any) {
      setError(err?.message || 'Не удалось выполнить анализ.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="ai-analysis-modal"
        className="bg-[#FFFDF9] dark:bg-[#1C1916] rounded-3xl border border-[#DCD1C0] dark:border-[#383127] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="p-6 border-b border-[#E8DFD1] dark:border-[#2E2820] flex items-center justify-between bg-[#F7F2E7]/60 dark:bg-[#231F1A]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E9EDC9] dark:bg-[#2B3220] border border-[#CAD4AC] dark:border-[#424D31] flex items-center justify-center shadow-2xs">
              <BrainCircuit className="w-5 h-5 text-[#4F5938] dark:text-[#D9E2A8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif italic text-lg text-[#2D2722] dark:text-[#EAE5D9]">
                  ИИ-Анализ: Чтение между строк
                </h3>
                <span className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded-full bg-[#7C8363]/15 text-[#555C40] dark:text-[#C5CF9B] font-semibold">
                  {modelName}
                </span>
              </div>
              <p className="text-xs text-[#827768] dark:text-[#9C9385] font-serif">
                Глубинный разбор намерений за {formatRussianFullDate(entry.date)}
              </p>
            </div>
          </div>

          <button
            id="close-ai-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#827768] dark:text-[#9C9385] hover:bg-[#EFE8DC] dark:hover:bg-[#2B251E] hover:text-[#2D2722] dark:hover:text-[#EAE5D9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-4 rounded-2xl bg-[#FEF2F2] dark:bg-[#2D1717] border border-[#FCA5A5] dark:border-[#7F1D1D] text-[#991B1B] dark:text-[#FCA5A5] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                <p className="mt-1 opacity-90">
                  Убедитесь, что ваш API-ключ Gemini настроен в параметрах проекта.
                </p>
              </div>
            </div>
          )}

          {!analysis && !loading && (
            <div className="text-center py-8 px-4 space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-[#F7F2E7] dark:bg-[#25201A] border border-[#E8DFD1] dark:border-[#383127] flex items-center justify-center mx-auto text-2xl">
                🔮
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="font-serif italic text-base text-[#2D2722] dark:text-[#EAE5D9]">
                  Взгляните на свои мысли со стороны
                </h4>
                <p className="text-xs text-[#827768] dark:text-[#9C9385] leading-relaxed">
                  ИИ на базе последней модели <strong>{modelName}</strong> сопоставит ваши утренние цели и вечерние итоги, бережно прочитает между строк скрытые переживания, истинные ценности и поможет найти точку внутреннего баланса.
                </p>
              </div>

              {!hasContent && (
                <div className="p-3 rounded-xl bg-[#FEFAE0] dark:bg-[#2C2417] border border-[#EBE3B8] dark:border-[#4B3C24] text-[#7A5A35] dark:text-[#F3D7AB] text-xs max-w-md mx-auto flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 shrink-0" />
                  <span>Для анализа сначала сделайте хотя бы 1-2 записи за этот день.</span>
                </div>
              )}

              <button
                id="start-ai-analysis-btn"
                onClick={handleRunAnalysis}
                disabled={!hasContent}
                className={`px-6 py-3 rounded-2xl font-serif text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition-all ${
                  hasContent
                    ? 'bg-[#7C8363] dark:bg-[#6D7456] hover:bg-[#6D7456] dark:hover:bg-[#5E6548] text-white cursor-pointer'
                    : 'bg-[#E5E1D8] dark:bg-[#2B2620] text-[#A89F91] dark:text-[#6E6457] cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Прочесть между строк</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-4">
              <RefreshCw className="w-8 h-8 text-[#7C8363] dark:text-[#B4BE82] animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="font-serif italic text-sm text-[#2D2722] dark:text-[#EAE5D9]">
                  Вчитываемся в ваши слова и контекст...
                </p>
                <p className="text-xs text-[#827768] dark:text-[#9C9385]">
                  Модель {modelName} анализирует неосознанные намерения и подбирает точные вопросы
                </p>
              </div>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-4">
              <div className="bg-[#FAF8F3] dark:bg-[#231F1A] p-6 rounded-2xl border border-[#E8DFD1] dark:border-[#383127] shadow-2xs">
                <div className="prose dark:prose-invert prose-stone max-w-none text-xs sm:text-sm leading-relaxed text-[#2D2722] dark:text-[#EAE5D9] font-serif space-y-3">
                  <Markdown>{analysis}</Markdown>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#827768] dark:text-[#9C9385] pt-1">
                <span className="flex items-center gap-1.5 font-serif">
                  <Lock className="w-3.5 h-3.5 text-[#7C8363] dark:text-[#B4BE82]" />
                  {currentUser ? 'Сохранено в вашем приватном облаке' : 'Сохранено на устройстве'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    id="copy-analysis-btn"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl border border-[#DCD1C0] dark:border-[#383127] hover:bg-[#EFE8DC] dark:hover:bg-[#2B251E] flex items-center gap-1.5 transition-colors font-serif"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#555C40] dark:text-[#B4BE82]" />
                        <span>Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Скопировать</span>
                      </>
                    )}
                  </button>

                  <button
                    id="reanalyze-btn"
                    onClick={handleRunAnalysis}
                    className="px-3 py-1.5 rounded-xl bg-[#7C8363] dark:bg-[#6D7456] text-white hover:bg-[#6D7456] dark:hover:bg-[#5E6548] flex items-center gap-1.5 transition-colors font-serif"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Обновить анализ</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
