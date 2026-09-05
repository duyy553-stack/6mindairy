import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('Ключ GEMINI_API_KEY не задан в переменных окружения. Укажите его в настройках проекта.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// Health and capability check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.8-flash',
  });
});

// AI analysis endpoint: reads between the lines
app.post('/api/analyze', async (req, res) => {
  try {
    const { entry } = req.body;

    if (!entry) {
      return res.status(400).json({ error: 'Данные записи дневника не переданы.' });
    }

    const ai = getAI();

    // Prepare readable representations of the entries
    const morningGratitude = (entry.morning?.gratitude || []).filter(Boolean).join('\n  - ');
    const morningMakesGreat = (entry.morning?.makesGreat || []).filter(Boolean).join('\n  - ');
    const morningAffirmation = entry.morning?.affirmation || '';

    const eveningGoodDeed = entry.evening?.goodDeed || '';
    const eveningImprovement = entry.evening?.improvement || '';
    const eveningGreatMoments = (entry.evening?.greatMoments || []).filter(Boolean).join('\n  - ');
    const eveningMood = entry.evening?.mood;

    const hasAnyContent = morningGratitude || morningMakesGreat || morningAffirmation || 
                          eveningGoodDeed || eveningImprovement || eveningGreatMoments;

    if (!hasAnyContent) {
      return res.status(400).json({ 
        error: 'В дневнике за этот день пока нет текста для анализа. Заполните хотя бы одну строчку в утренней или вечерней странице.' 
      });
    }

    const prompt = `Ты — внимательный, чуткий психолог-коуч и аналитик дневниковых записей.
Твоя задача — внимательно вчитаться в записи пользователя из «Дневника 6 минут», ПРОЧИТАТЬ МЕЖДУ СТРОК и выявить подлинные намерения пользователя, глубинные эмоциональные потребности, скрытые паттерны и дать мудрую обратную связь.

ДАТА ЗАПИСИ: ${entry.date}

ДАННЫЕ ДНЕВНИКА:
${morningGratitude ? `[Утро] Я благодарен за:\n  - ${morningGratitude}` : ''}
${morningMakesGreat ? `[Утро] Что сделает этот день прекрасным:\n  - ${morningMakesGreat}` : ''}
${morningAffirmation ? `[Утро] Позитивная установка / аффирмация: ${morningAffirmation}` : ''}
${eveningGoodDeed ? `[Вечер] Доброе дело дня: ${eveningGoodDeed}` : ''}
${eveningImprovement ? `[Вечер] Что можно было сделать лучше: ${eveningImprovement}` : ''}
${eveningGreatMoments ? `[Вечер] Прекрасные события и моменты:\n  - ${eveningGreatMoments}` : ''}
${eveningMood ? `[Вечер] Оценка самочувствия/настроения: ${eveningMood} из 5` : ''}

СФОРМУЛИРУЙ АНАЛИЗ В ДЕЛИКАТНОМ, МУДРОМ И СТРУКТУРИРОВАННОМ ВИДЕ (используй Markdown):

1. 🔍 **Что читается между строк (скрытые намерения и состояние):**
Что автор чувствует на самом деле? К чему он бессознательно тянется? Есть ли фоновая тревожность, усталость, стремление к контролю, или наоборот — пробуждающаяся уверенность и жажда перемен?

2. 💎 **Ключевая потребность и ценности:**
Какая главная внутренняя потребность (принятие, отдых, безопасность, самореализация, близость) проявляется в этих словах?

3. 🌱 **Осознанный фокус и точка роста:**
На что автору стоит обратить внимание, чтобы не выгорать и сохранять верность себе?

4. ❓ **Вопрос для размышления:**
Один точный вопрос для внутренней честности, который поможет расставить приоритеты.

Отвечай на русском языке, поддерживающе, без банальных клише и нравоучений.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const analysisText = response.text || 'Не удалось получить ответ модели.';
    return res.json({ 
      analysis: analysisText, 
      model: 'gemini-3.8-flash' 
    });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    const msg = error?.message || 'Ошибка обращения к сервису анализа';
    return res.status(500).json({ error: msg });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
