export type DialectId = 'general' | 'algerois' | 'oranais' | 'constantinois' | 'saharien';

export interface DialectOption {
  id: DialectId;
  name: string;
  nameAr: string;
  region: string;
  description: string;
  example: string;
}

export type VoiceId = 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr';

export interface VoiceOption {
  id: VoiceId;
  name: string;
  gender: 'female' | 'male';
  tone: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  timestamp: number;
  text: string;
  arabizi?: string;
  audioUrl?: string; // Blob or Data URL for playback
  audioBase64?: string;
  isAudioLoading?: boolean;
  userAudioUrl?: string; // If user sent voice note
  sources?: Array<{ title: string; uri: string }>;
  quickSuggestions?: string[];
  dialect?: DialectId;
}

export interface AlgerianExpression {
  phraseAr: string;
  arabizi: string;
  meaningFr: string;
  meaningAr: string;
  usageContext: string;
  region: string;
}

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'greeting';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  dialect: DialectId;
  voice: VoiceId;
  messages: ChatMessage[];
}

