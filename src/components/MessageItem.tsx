import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Mic,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { ChatMessage, VoiceId } from '../types';

interface MessageItemProps {
  message: ChatMessage;
  isPlaying: boolean;
  onPlayAudio: (messageId: string, text: string) => void;
  onStopAudio: () => void;
  onSelectSuggestion?: (text: string) => void;
  selectedVoice: VoiceId;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isPlaying,
  onPlayAudio,
  onStopAudio,
  onSelectSuggestion,
  selectedVoice,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showArabizi, setShowArabizi] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAudio = () => {
    if (!message.audioUrl) return;
    const a = document.createElement('a');
    a.href = message.audioUrl;
    a.download = `sawti-ai-response-${message.id.slice(0, 6)}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className={`flex flex-col gap-2 ${
        isUser ? 'items-end' : 'items-start'
      } transition-all duration-300 animate-fadeIn`}
    >
      {/* Role label & timestamp */}
      <div className="flex items-center gap-2 px-1 text-xs text-slate-400">
        {isUser ? (
          <>
            <span>أنت (Vous)</span>
            {message.userAudioUrl && (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Mic className="w-3 h-3" />
                <span>رسالة صوتية</span>
              </span>
            )}
          </>
        ) : (
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>صوتي (Sawti AI)</span>
          </div>
        )}
      </div>

      {/* Message Card Container */}
      <div
        className={`max-w-[92%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-lg relative ${
          isUser
            ? 'bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white rounded-tr-none border border-emerald-400/30'
            : 'bg-slate-900/90 text-slate-100 rounded-tl-none border border-emerald-500/25 backdrop-blur-md shadow-emerald-950/20'
        }`}
      >
        {/* If user sent a voice clip, show audio playback for their own voice */}
        {isUser && message.userAudioUrl && (
          <div className="mb-3 p-2.5 rounded-xl bg-black/25 border border-white/10 flex items-center gap-2.5">
            <audio src={message.userAudioUrl} controls className="w-full h-8" />
          </div>
        )}

        {/* User Voice Transcribed indicator */}
        {isUser && message.userAudioUrl && (
          <div className="text-[11px] mb-2 text-emerald-100/80 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>نص الكلام بالدارجة (Transcrit par gemini-3.5-transcribe) :</span>
          </div>
        )}

        {/* Message Main Content (Arabic Script Algerian Darija) */}
        <div
          dir="rtl"
          className={`font-arabic text-right leading-relaxed ${
            isUser ? 'text-base sm:text-lg font-medium text-white' : 'text-base sm:text-lg text-slate-100 font-semibold'
          }`}
        >
          {message.text}
        </div>

        {/* Arabizi phonetics preview/toggle */}
        {message.arabizi && (
          <div className="mt-3 pt-3 border-t border-slate-700/60" dir="ltr">
            <button
              onClick={() => setShowArabizi(!showArabizi)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition font-medium"
            >
              <span>{showArabizi ? 'إخفاء الأرابيزي' : 'عرض باللاتينية (Arabizi 3, 7, 9)'}</span>
              {showArabizi ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showArabizi && (
              <p className="mt-2 text-xs sm:text-sm font-mono bg-slate-950/70 p-2.5 rounded-xl text-emerald-300 border border-emerald-500/20 tracking-wide select-all">
                {message.arabizi}
              </p>
            )}
          </div>
        )}

        {/* Audio Player for Assistant Response */}
        {!isUser && (
          <div className="mt-4 pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isPlaying) {
                    onStopAudio();
                  } else {
                    onPlayAudio(message.id, message.text);
                  }
                }}
                disabled={message.isAudioLoading}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/30'
                } ${message.isAudioLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {message.isAudioLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>توليد الصوت...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>إيقاف الصوت</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>استمع للرد (TTS)</span>
                  </>
                )}
              </button>

              {message.audioUrl && (
                <button
                  onClick={handleDownloadAudio}
                  title="تحميل الملف الصوتي (.wav)"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition"
                title="نسخ النص"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Search Grounding Sources (Google Search) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-800" dir="ltr">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Sources en direct (Google Search) :</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((s, idx) => (
                <a
                  key={idx}
                  href={s.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-[11px] border border-slate-700 transition max-w-xs truncate"
                >
                  <span className="truncate">{s.title || s.uri}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested continuation questions */}
      {!isUser && message.quickSuggestions && message.quickSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1 max-w-[85%]" dir="rtl">
          {message.quickSuggestions.map((sugg, i) => (
            <button
              key={i}
              onClick={() => onSelectSuggestion?.(sugg)}
              className="font-arabic text-xs bg-slate-900/80 hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-400 px-3 py-1.5 rounded-xl transition shadow-sm text-right flex items-center gap-1.5"
            >
              <span>💬</span>
              <span>{sugg}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
