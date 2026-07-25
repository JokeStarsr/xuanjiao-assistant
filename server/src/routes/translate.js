const express = require('express');
const { getDb, queryAll, queryOne, run } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 内置常用短语库
const commonPhrases = {
  'zh-en': {
    greeting: [
      { zh: '你好', en: 'Hello' },
      { zh: '早上好', en: 'Good morning' },
      { zh: '晚上好', en: 'Good evening' },
      { zh: '再见', en: 'Goodbye' },
      { zh: '很高兴认识你', en: 'Nice to meet you' },
      { zh: '上帝保佑你', en: 'God bless you' },
      { zh: '耶稣爱你', en: 'Jesus loves you' },
      { zh: '愿平安与你同在', en: 'Peace be with you' },
    ],
    transport: [
      { zh: '请问怎么去...？', en: 'How can I get to...?' },
      { zh: '这里离机场多远？', en: 'How far is the airport?' },
      { zh: '请问公交站在哪里？', en: 'Where is the bus stop?' },
      { zh: '我要去教堂', en: 'I want to go to the church' },
    ],
    dining: [
      { zh: '有什么推荐的？', en: 'What do you recommend?' },
      { zh: '我不吃肉', en: "I don't eat meat" },
      { zh: '请给我一杯水', en: 'A glass of water, please' },
      { zh: '谢谢', en: 'Thank you' },
    ],
    accommodation: [
      { zh: '有房间吗？', en: 'Do you have a room?' },
      { zh: '一晚多少钱？', en: 'How much per night?' },
      { zh: '我想预订', en: 'I would like to make a reservation' },
    ],
    emergency: [
      { zh: '救命！', en: 'Help!' },
      { zh: '请叫医生', en: 'Please call a doctor' },
      { zh: '我需要帮助', en: 'I need help' },
      { zh: '请报警', en: 'Please call the police' },
    ],
  },
  'zh-es': {
    greeting: [
      { zh: '你好', es: 'Hola' },
      { zh: '早上好', es: 'Buenos días' },
      { zh: '晚上好', es: 'Buenas noches' },
      { zh: '再见', es: 'Adiós' },
      { zh: '上帝保佑你', es: 'Dios te bendiga' },
      { zh: '耶稣爱你', es: 'Jesús te ama' },
    ],
    transport: [
      { zh: '请问怎么去...？', es: '¿Cómo puedo llegar a...?' },
      { zh: '请问公交站在哪里？', es: '¿Dónde está la parada de autobús?' },
    ],
    dining: [
      { zh: '谢谢', es: 'Gracias' },
      { zh: '请给我一杯水', es: 'Un vaso de agua, por favor' },
    ],
    emergency: [
      { zh: '救命！', es: '¡Socorro!' },
      { zh: '我需要帮助', es: 'Necesito ayuda' },
    ],
  },
  'zh-ar': {
    greeting: [
      { zh: '你好', ar: 'السلام عليكم' },
      { zh: '再见', ar: 'مع السلامة' },
      { zh: '谢谢', ar: 'شكراً' },
      { zh: '上帝保佑你', ar: 'بارك الله فيك' },
    ],
    emergency: [
      { zh: '救命！', ar: 'النجدة!' },
      { zh: '我需要帮助', ar: 'أحتاج مساعدة' },
    ],
  },
  'zh-ko': {
    greeting: [
      { zh: '你好', ko: '안녕하세요' },
      { zh: '谢谢', ko: '감사합니다' },
      { zh: '再见', ko: '안녕히 가세요' },
      { zh: '上帝保佑你', ko: '하나님이 당신을 축복하시길' },
    ],
    emergency: [
      { zh: '救命！', ko: '살려주세요!' },
      { zh: '我需要帮助', ko: '도움이 필요해요' },
    ],
  },
  'zh-ja': {
    greeting: [
      { zh: '你好', ja: 'こんにちは' },
      { zh: '谢谢', ja: 'ありがとうございます' },
      { zh: '再见', ja: 'さようなら' },
      { zh: '上帝保佑你', ja: '神の祝福がありますように' },
    ],
    emergency: [
      { zh: '救命！', ja: '助けて!' },
      { zh: '我需要帮助', ja: '助けが必要です' },
    ],
  },
};

// 获取日常用语短语
router.get('/phrases', (req, res) => {
  const { sourceLang = 'zh', targetLang = 'en' } = req.query;
  const key = `${sourceLang}-${targetLang}`;
  const phrases = commonPhrases[key] || commonPhrases['zh-en'];
  const target = key === 'zh-en' ? 'en' : targetLang;
  res.json({ phrases, sourceLang, targetLang: target });
});

// 文本翻译
router.post('/text', authMiddleware, async (req, res) => {
  const { text, sourceLang = 'zh', targetLang = 'en' } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: '请输入要翻译的文本' });
  }

  // 模拟翻译（实际应用对接翻译API）
  const translatedText = `[${targetLang}] ${text}`;

  // 保存翻译历史
  await getDb();
  run(
    'INSERT INTO translation_history (user_id, source_text, translated_text, source_lang, target_lang) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, text, translatedText, sourceLang, targetLang]
  );

  res.json({
    sourceText: text,
    translatedText,
    sourceLang,
    targetLang,
  });
});

// 获取翻译历史
router.get('/history', authMiddleware, async (req, res) => {
  await getDb();
  const history = queryAll(
    'SELECT * FROM translation_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
    [req.user.id]
  );
  res.json(history);
});

// 获取支持的语言列表
router.get('/languages', (req, res) => {
  res.json([
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ar', name: 'العربية' },
    { code: 'ko', name: '한국어' },
    { code: 'ja', name: '日本語' },
    { code: 'fr', name: 'Français' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'th', name: 'ไทย' },
    { code: 'sw', name: 'Kiswahili' },
    { code: 'hi', name: 'हिन्दी' },
  ]);
});

module.exports = router;