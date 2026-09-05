import React, { useRef } from 'react';
import { X, Download, Upload, BookOpen, Heart, Sparkles, Check } from 'lucide-react';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const json = exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dnevnik-6-minut-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJSON(content);
        if (success) {
          alert('Данные дневника успешно восстановлены!');
          onDataImported();
          onClose();
        } else {
          alert('Ошибка при чтении файла. Убедитесь, что это корректный файл резервной копии JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="about-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FFFDF9] dark:bg-[#1E1B17] border border-[#E5E1D8] dark:border-[#383127] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] p-2 rounded-full transition-colors"
          title="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#E9EDC9] dark:bg-[#2B3220] flex items-center justify-center text-[#7C8363] dark:text-[#B4BE82]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#7C8363] dark:text-[#B4BE82] font-semibold block font-sans">
              Методика и научная основа
            </span>
            <h2 className="text-2xl font-serif italic text-[#38332E] dark:text-[#EAE5D9]">
              О философии «Дневника 6 минут»
            </h2>
            <p className="text-xs text-[#827768] dark:text-[#9C9385] font-serif">
              Проверенная наукой методика позитивной психологии Доминика Спенста
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-5 text-xs sm:text-sm text-[#38332E] dark:text-[#EAE5D9] leading-relaxed max-h-[60vh] overflow-y-auto pr-2 font-serif">
          {/* Section 1 */}
          <div className="bg-[#FAF8F3] dark:bg-[#25211D] p-5 rounded-2xl border border-[#E5E1D8] dark:border-[#383127] space-y-2 shadow-2xs">
            <h3 className="font-serif italic text-base text-[#38332E] dark:text-[#EAE5D9] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7C8363] dark:text-[#B4BE82]" />
              Сила утренней и вечерней практики
            </h3>
            <p className="text-[#524B42] dark:text-[#C4BCAD] text-xs leading-relaxed">
              Мозг человека эволюционно склонен концентрироваться на угрозах и негативе (так называемый <em>negativity bias</em>). Практика мягко перестраивает нейронные пути (нейропластичность), приучая мозг замечать хорошее и фокусироваться на созидании в комфортном для вас темпе без спешки и ограничений.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#524B42] dark:text-[#C4BCAD] text-xs">
              <li><strong>Утром:</strong> Настраивает фильтр внимания на возможности, благодарность и доброжелательность в предстоящем дне.</li>
              <li><strong>Вечером:</strong> Помогает закрепить сделанное добро, извлечь урок без самобичевания и отпустить суету перед спокойным сном.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-[#FAF8F3] dark:bg-[#25211D] p-5 rounded-2xl border border-[#E5E1D8] dark:border-[#383127] space-y-2 shadow-2xs">
            <h3 className="font-serif italic text-base text-[#38332E] dark:text-[#EAE5D9] flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#D4A373]" />
              Золотое правило благодарности: конкретность
            </h3>
            <p className="text-[#524B42] dark:text-[#C4BCAD] text-xs leading-relaxed">
              Вместо абстрактных фраз вроде «благодарен за жизнь» или «за семью», старайтесь подмечать мелкие, уникальные детали:
            </p>
            <div className="bg-[#E9EDC9]/40 dark:bg-[#2B3220]/60 p-3.5 rounded-xl border border-[#D5DCB3] dark:border-[#424D31] text-xs text-[#4F5938] dark:text-[#D9E2A8] font-serif italic">
              «За теплый шерстяной плед в холодное утро», «За то, как бариста нарисовал сердечко на пенке капучино», «За то, что друг выслушал меня, не перебивая».
            </div>
          </div>

          {/* Backup & Data Management */}
          <div className="bg-[#FAF8F3] dark:bg-[#25211D] p-5 rounded-2xl border border-[#E5E1D8] dark:border-[#383127] space-y-3 shadow-2xs">
            <h3 className="font-serif italic text-base text-[#38332E] dark:text-[#EAE5D9]">
              Ваши данные и резервные копии
            </h3>
            <p className="text-xs text-[#827768] dark:text-[#9C9385]">
              Все ваши записи надежно и конфиденциально сохраняются в локальном хранилище вашего браузера. Вы можете в любой момент выгрузить их в файл или восстановить на другом устройстве.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-[#7C8363] text-white rounded-xl text-xs font-serif font-medium flex items-center gap-2 hover:bg-[#6D7456] transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>Скачать все записи (резервная копия)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white dark:bg-[#1E1B17] border border-[#E5E1D8] dark:border-[#383127] text-[#38332E] dark:text-[#EAE5D9] rounded-xl text-xs font-serif font-medium flex items-center gap-2 hover:bg-[#FAF8F3] dark:hover:bg-[#2E2822] transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Восстановить из файла</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-[#E9EDC9] dark:bg-[#2B3220] text-[#4F5938] dark:text-[#D9E2A8] border border-[#CAD4AC] dark:border-[#424D31] rounded-xl text-xs font-serif font-medium flex items-center gap-2 hover:bg-[#DFE7BD] dark:hover:bg-[#353E27] transition-colors"
              >
                <span>Печать / Сохранить в PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#EFE8DC] dark:border-[#2E2820] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#7C8363] text-white text-xs font-serif font-medium rounded-2xl hover:bg-[#6D7456] transition-colors shadow-2xs"
          >
            Понятно, вернуться к дневнику
          </button>
        </div>
      </div>
    </div>
  );
};
