export default function handler(_req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    platform: 'vercel',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.8-flash',
  });
}
