import { ChatSession, ChatMessage, DialectId, VoiceId } from '../types';

const STORAGE_KEY = 'sawti_chat_sessions_v2';
const ACTIVE_SESSION_KEY = 'sawti_active_session_id_v2';

export const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-init',
  role: 'model',
  timestamp: Date.now(),
  text: 'سلام عليكم خويا / ختي، مرحبا بيك في صوتي (Sawti AI)! أنا المساعد الصوتي تاعك بالدارجة الجزائرية. تقدر تهدر معايا بالميكروفون ولا تكتب لي، ونجاوبك بالكتيبة وبالصوت. واش نقدر نعاونك اليوم؟',
  arabizi: 'Salam 3likom, merhba bik f Sawti AI! Ana l-moussa3id sawti ta3ek bdarija jazairia. Te9der tehder m3aya b mic wela tektobli. Wach ne9der n3awnek lyoum?',
  quickSuggestions: [
    'واش راك خويا، لاباس؟',
    'شحال راه الأورو اليوم في السكوار؟',
    'كيفاش نأكتيفي تطبيق بريدي موب؟',
    'أعطيني وصفة شخشوخة بسكرية حارة',
  ],
};

/**
 * Creates a brand new chat session with default welcome message
 */
export function createNewSession(dialect: DialectId = 'general', voice: VoiceId = 'Kore'): ChatSession {
  const id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  return {
    id,
    title: 'محادثة جديدة (Nouvelle session)',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    dialect,
    voice,
    messages: [
      {
        ...DEFAULT_WELCOME_MESSAGE,
        id: 'welcome-' + Date.now(),
        timestamp: Date.now(),
      },
    ],
  };
}

/**
 * Sanitize messages for localStorage storage (strip massive base64 audio to prevent quota exceeded)
 */
function sanitizeSessionForStorage(session: ChatSession): ChatSession {
  return {
    ...session,
    messages: session.messages.map((m) => {
      // Keep audioUrl if it's not a giant blob or truncate base64 for persistent storage
      const copy = { ...m };
      if (copy.audioBase64 && copy.audioBase64.length > 50000) {
        delete copy.audioBase64;
      }
      return copy;
    }),
  };
}

/**
 * Load all stored chat sessions from localStorage
 */
export function loadSessionsFromStorage(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Error loading sessions from storage:', err);
    return [];
  }
}

/**
 * Save array of sessions to localStorage
 */
export function saveSessionsToStorage(sessions: ChatSession[]): void {
  try {
    const sanitized = sessions.map(sanitizeSessionForStorage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn('LocalStorage save failed, trying to prune older audio:', err);
    try {
      // Remove all audio URLs to save space
      const light = sessions.map((s) => ({
        ...s,
        messages: s.messages.map((m) => {
          const { audioBase64, userAudioUrl, ...rest } = m;
          return rest;
        }),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(light));
    } catch (e) {
      console.error('Critical localStorage failure:', e);
    }
  }
}

/**
 * Get active session ID from localStorage
 */
export function getActiveSessionIdFromStorage(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

/**
 * Set active session ID in localStorage
 */
export function setActiveSessionIdInStorage(sessionId: string): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  } catch (e) {
    console.error('Failed to set active session ID:', e);
  }
}

/**
 * Derives a smart session title from the first user message
 */
export function deriveSessionTitle(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find((m) => m.role === 'user');
  if (!firstUserMsg) return 'محادثة صوتية جديدة';

  let title = firstUserMsg.text.replace(/[\n\r]+/g, ' ').trim();
  if (title.startsWith('🎙️')) {
    title = title.replace('🎙️', '').trim();
  }
  if (title.length > 38) {
    return title.slice(0, 36) + '...';
  }
  return title || 'محادثة صوتية';
}

/**
 * Export sessions as JSON file
 */
export function exportSessionsAsJson(sessions: ChatSession[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute('href', dataStr);
  dlAnchorElem.setAttribute('download', `sawti-ai-conversations-${new Date().toISOString().slice(0, 10)}.json`);
  dlAnchorElem.click();
}
