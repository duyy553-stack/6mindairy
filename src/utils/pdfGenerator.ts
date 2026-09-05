import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DailyEntry, WeeklyReflection } from '../types';
import { formatRussianFullDate } from './dateUtils';

export interface PdfExportOptions {
  period: 'week' | 'month' | 'prev-month' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
  includeMorning: boolean;
  includeEvening: boolean;
  includeAiNotes: boolean;
  includeWeeklyQuestions: boolean;
}

// Map mood numbers to readable text
const MOOD_MAP: Record<number, string> = {
  1: 'Тяжелый день (1/5)',
  2: 'Непростой день (2/5)',
  3: 'Обычный день (3/5)',
  4: 'Хороший день (4/5)',
  5: 'Прекрасный день (5/5)',
};

/**
 * Filter entries according to user selected period
 */
export function filterEntriesForExport(
  entries: Record<string, DailyEntry>,
  options: PdfExportOptions,
  referenceDate = new Date()
): DailyEntry[] {
  const allList = Object.values(entries).sort((a, b) => a.date.localeCompare(b.date));

  if (options.period === 'all') {
    return allList;
  }

  const now = referenceDate;
  let start = '';
  let end = '';

  if (options.period === 'week') {
    // Past 7 days up to today
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    start = d.toISOString().split('T')[0];
    end = now.toISOString().split('T')[0];
  } else if (options.period === 'month') {
    // Current calendar month
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    start = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    end = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  } else if (options.period === 'prev-month') {
    // Previous calendar month
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = prevDate.getFullYear();
    const month = String(prevDate.getMonth() + 1).padStart(2, '0');
    start = `${year}-${month}-01`;
    const lastDay = new Date(year, prevDate.getMonth() + 1, 0).getDate();
    end = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  } else if (options.period === 'custom' && options.startDate && options.endDate) {
    start = options.startDate;
    end = options.endDate;
  }

  return allList.filter((e) => {
    if (start && e.date < start) return false;
    if (end && e.date > end) return false;
    return true;
  });
}

/**
 * Generates and downloads a multi-page PDF from a list of page container elements.
 */
export async function generatePdfFromPages(
  pageElements: HTMLElement[],
  filename: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (pageElements.length === 0) {
    throw new Error('Нет страниц для экспорта');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

  for (let i = 0; i < pageElements.length; i++) {
    if (onProgress) {
      onProgress(i + 1, pageElements.length);
    }

    const pageElem = pageElements[i];

    // High resolution rendering for crisp print fonts
    const canvas = await html2canvas(pageElem, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: 794, // Standard A4 width at 96 DPI
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  }

  pdf.save(filename);
}
