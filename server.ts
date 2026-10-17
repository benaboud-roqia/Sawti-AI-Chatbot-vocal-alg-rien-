import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Allow large payloads for base64 audio
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Shared server-side Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Retry helper for handling temporary 503 high demand spikes
async function retryOperation<T>(fn: () => Promise<T>, maxRetries = 2, delayMs = 1000): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 503 ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.status === 429;

      if (isTransient && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// 1. Audio Transcription Endpoint (STT using gemini-3.5-transcribe)
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', dialect = 'General' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const ai = getAiClient();

    // Clean base64 if it has a prefix
    const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9.-]+;base64,/, '');

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const promptText = `You are a specialist in Algerian Darija (الدارجة الجزائرية) audio transcription.
Listen closely to this audio spoken by an Algerian speaker (dialect context: ${dialect}).
Transcribe the speech accurately into Algerian Darija written in Arabic script.
If the speaker used French words or mixed Franco-Arabe (which is common in Algeria), transcribe those natural loanwords or write them appropriately.
Also provide the phonetic Arabizi version (Latin characters with numbers like 3, 7, 9).
Output strictly valid JSON with this exact structure:
{
  "transcription": "النص بالدارجة الجزائرية بالحرف العربي",
  "arabizi": "transcription en arabizi (ex: wach rak khoya labas)",
  "detectedTone": "friendly/inquiry/urgent/humorous/neutral"
}
Do not include markdown backticks around the json, only raw JSON.`;

    const response = await retryOperation(() =>
      ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            { text: promptText },
          ],
        },
      })
    );

    const outputText = response.text || '';
    let parsedData = { transcription: '', arabizi: '', detectedTone: 'neutral' };

    try {
      const sanitized = outputText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(sanitized);
    } catch {
      parsedData = {
        transcription: outputText.trim(),
        arabizi: '',
        detectedTone: 'neutral',
      };
    }

    return res.json({
      success: true,
      text: parsedData.transcription || outputText.trim(),
      arabizi: parsedData.arabizi || '',
      tone: parsedData.detectedTone,
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to transcribe audio.',
    });
  }
});

// 2. Chat / NLP Endpoint (Using gemini-3.8-flash with optional Google Search)
app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      history = [],
      dialect = 'General',
      tone = 'chaleureux',
      enableSearch = true,
      outputFormat = 'darija_arabic',
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAiClient();

    const systemInstruction = `You are "Sawti AI" (صوتي), the premier intelligent Algerian voice AI assistant.
You speak authentic Algerian Darija (لهجة جزائرية حية وأصيلة) with high cultural nuance, warmth, humor, and deep knowledge of Algeria.
- Dialect specificity: ${dialect} (e.g. Algérois/Casbah style "واش يا خو", Oranais "واه خويا / راك غاية", Constantinois "واش راك / يسلمك", Saharien "يا مرحبا بيك", or Pan-Algerian).
- Tone: ${tone}. Respectful, welcoming ("مرحبا بيك", "الله يسلمك", "يعطيك الصحة"), friendly.
- Mastery of Algerian vocabulary: "لاباس", "صافا", "واش كاين", "برك", "بزاف", "شوية", "هكذا", "دير", "حبس", "شكون", "وقتاش", "وينتا", "على بالي", "ماشي مشكل", "حنا في حنا".
- Knowledge domain: Algerian administrative procedures (BaridiMob, CCP, Chifa, Cnas, passport, carte grise), cities (Algiers, Oran, Constantine, Annaba, Sétif, Tlemcen, Bejaia, Ghardaïa, etc.), culinary recipes (Chakhchoukha, Rechta, Couscous, Garantita, Mahdjouba, Chorba Frik, Makroudh), sports (Equipe Nationale les Fennecs, Riyad Mahrez, Algerian Ligue 1), and general topics.
- When replying, always craft a response primarily in natural Algerian Darija written in Arabic script.
- Also supply the Arabizi phonetic equivalent (Latin alphabet with 3=ع, 7=ح, 9=ق, 5=خ, 2=ء) so users can read or learn phonetics.
- Format your response as a valid JSON object:
{
  "reply": "نص الرد بالدارجة الجزائرية بالعربية",
  "arabizi": "Radd bi l-arabizi",
  "summaryForSpeech": "نسخة موجزة وسلسة للنطق الصوتي خالية من الرموز والروابط المعقدة",
  "quickSuggestions": ["سؤال مقترح 1", "سؤال مقترح 2", "سؤال مقترح 3"]
}
Only output the raw JSON object, without backticks or extra text.`;

    // Build contents from history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const h of history.slice(-8)) {
      if (h.role === 'user' || h.role === 'model') {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const config: any = {
      systemInstruction,
      temperature: 0.7,
    };

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    let response: any;
    try {
      response = await retryOperation(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config,
        })
      );
    } catch (modelErr: any) {
      // If gemini-3.8-flash is busy, fallback to gemini-3.1-flash-lite
      console.warn('Fallback to gemini-3.1-flash-lite:', modelErr?.message);
      const liteConfig = { ...config };
      delete liteConfig.tools; // simpler fallback
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: liteConfig,
      });
    }

    const rawOutput = response.text || '';
    let parsed: any = null;

    try {
      const sanitized = rawOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(sanitized);
    } catch {
      parsed = {
        reply: rawOutput.trim(),
        arabizi: '',
        summaryForSpeech: rawOutput.trim(),
        quickSuggestions: [],
      };
    }

    // Extract search grounding sources if present
    const sources: Array<{ title: string; uri: string }> = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
          });
        }
      }
    }

    return res.json({
      success: true,
      reply: parsed.reply || rawOutput.trim(),
      arabizi: parsed.arabizi || '',
      summaryForSpeech: parsed.summaryForSpeech || parsed.reply || rawOutput.trim(),
      quickSuggestions: parsed.quickSuggestions || [],
      sources,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process chat message.',
    });
  }
});

// 3. Text-to-Speech Endpoint (Using gemini-3.8-flash-tts)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', style = 'Friendly, clear Algerian Arabic speaker' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const ai = getAiClient();

    const ttsRequest = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 500),
              speechMetadata: {
                style: `${style}. Natural cadence, authentic Maghrebi/Algerian Arabic pronunciation.`,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || 'Kore',
            },
          },
        },
      },
    };

    let response: any;
    try {
      response = await retryOperation(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash-tts',
          ...ttsRequest,
        })
      );
    } catch (ttsErr: any) {
      console.warn('Fallback to gemini-3.8-flash-lite-tts:', ttsErr?.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        ...ttsRequest,
      });
    }

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio returned by speech synthesis model');
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to synthesize speech.',
    });
  }
});

// 4. Quick Transliteration/Dialect Explainer API
app.post('/api/explain-darija', async (req, res) => {
  try {
    const { phrase } = req.body;
    if (!phrase) return res.status(400).json({ error: 'Phrase is required' });

    const ai = getAiClient();
    const prompt = `Analyze this Algerian Darija phrase: "${phrase}".
Provide:
1. Meaning in Standard Arabic & French
2. Regional origins or nuances (e.g. Algérois, Oranais, Constantinois, etc.)
3. Cultural context and typical situations to use it.
Output in JSON:
{
  "phrase": "${phrase}",
  "arabicStandard": "...",
  "frenchMeaning": "...",
  "region": "...",
  "culturalNote": "..."
}`;

    const response = await retryOperation(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      })
    );

    return res.json(JSON.parse(response.text || '{}'));
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Sawti AI server running at http://0.0.0.0:${port}`);
  });
}

startServer();
