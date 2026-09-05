import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('Ключ GEMINI_API_KEY не найден в переменных окружения Vercel. Добавьте его в настройках проекта на Vercel.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function generateWithRetry(ai: GoogleGenAI, prompt: string, maxRetries = 3) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (response?.text) {
          return { text: response.text, model };
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        if (attempt < maxRetries - 1 && (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE'))) {
          await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
}

export default async function handler(req: any, res: any) {
  // CORS support if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается. Используйте POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const entry = body?.entry;

    if (!entry) {
      return res.status(400).json({ error: 'Данные записи дневника не переданы.' });
    }

    const ai = getAI();

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
        error: 'В дневнике за этот день пока нет текста для анализа. Заполните хотя бы одну строчку.' 
      });
    }

    const prompt = `Ты — внимательный, чуткий психолог-коуч и аналитик дневниковых записей.
Твоя задача — внимательно вчитаться в записи пользователя из «Дневника 6 минут», ПРОЧИТАТЬ МЕЖДУ СТРОК и выявить подлинные намерения пользователя, глубинные эмоциональные потребности, скрытые паттерны и дать мудрую обратную связь.

ДАТА ЗАПИСИ: ${entry.date}

ДАННЫЕ ДНЕВНИКА:
${morningGratitude ? `[Утро] Я благодарен за:\n  - ${morningGratitude}` : ''}
${morningMakesGreat ? `[Утро] Что я могу сделать сегодня, чтобы почувствовать себя устойчивее (маленькие шаги):\n  - ${morningMakesGreat}` : ''}
${morningAffirmation ? `[Утро] Опорная мысль на сегодня (внутреннее напоминание): ${morningAffirmation}` : ''}
${eveningGoodDeed ? `[Вечер] Что я сделал сегодня такого, что важно для меня (без внешней оценки): ${eveningGoodDeed}` : ''}
${eveningImprovement ? `[Вечер] Что я сегодня понял о себе (опыт, инсайт): ${eveningImprovement}` : ''}
${eveningGreatMoments ? `[Вечер] Что сегодня было значимым / За что могу сказать себе спасибо:\n  - ${eveningGreatMoments}` : ''}
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

    const { text, model } = await generateWithRetry(ai, prompt, 3);

    return res.status(200).json({ 
      analysis: text, 
      model 
    });
  } catch (error: any) {
    console.error('Vercel API error:', error);
    let msg = error?.message || 'Ошибка сервера анализа';
    try {
      const parsed = JSON.parse(msg);
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    } catch {
      // not json
    }

    if (msg.includes('Quota exceeded') || msg.includes('quota') || msg.includes('429')) {
      msg = 'Превышен лимит запросов бесплатного тарифа. Подождите 15-20 секунд или используйте свой платный ключ Gemini.';
    } else if (msg.includes('high demand') || msg.includes('503') || msg.includes('UNAVAILABLE')) {
      msg = 'Сервер Gemini временно испытывает пиковую нагрузку. Пожалуйста, повторите попытку через пару секунд.';
    }

    return res.status(500).json({ error: msg });
  }
}
