import React from 'react';
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Trash2,
  Globe,
  Sliders,
  History,
  Bot,
  PanelLeft,
} from 'lucide-react';
import { DialectId, VoiceId } from '../types';
import { DIALECTS, VOICES } from '../data/algerianData';

interface HeaderProps {
  selectedDialect: DialectId;
  onSelectDialect: (d: DialectId) => void;
  selectedVoice: VoiceId;
  onSelectVoice: (v: VoiceId) => void;
  autoPlayAudio: boolean;
  onToggleAutoPlay: () => void;
  onOpenExpressions: () => void;
  onClearChat: () => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  sessionsCount: number;
  showAvatar: boolean;
  onToggleAvatar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDialect,
  onSelectDialect,
  selectedVoice,
  onSelectVoice,
  autoPlayAudio,
  onToggleAutoPlay,
  onOpenExpressions,
  onClearChat,
  onOpenSettings,
  onToggleSidebar,
  sessionsCount,
  showAvatar,
  onToggleAvatar,
}) => {
  const currentDialect = DIALECTS.find((d) => d.id === selectedDialect) || DIALECTS[0];

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/90 border-b border-emerald-500/20 px-3 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* History Sidebar Button */}
          <button
            onClick={onToggleSidebar}
            title="فتح سجل المحادثات (Sessions)"
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/50 hover:border-emerald-400 transition"
          >
            <PanelLeft className="w-4 h-4" />
            <span className="hidden md:inline font-arabic">المحادثات ({sessionsCount})</span>
          </button>

          {/* Logo & Algerian Identity Badge */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 shadow-md shadow-emerald-950/60 border border-emerald-400/30">
              <Mic className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border border-white/70"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-1">
                  <span>Sawti AI</span>
                  <span className="font-arabic text-emerald-400 font-bold">صوتي</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  3D + Darija 🇩🇿
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block">
                Chatbot vocal avec Avatar 3D • <span className="text-emerald-400 font-medium">Par BENABOUD ROQIA</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Avatar 3D Toggle */}
          <button
            onClick={onToggleAvatar}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
              showAvatar
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Afficher/Masquer l'Avatar 3D"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-arabic">الأفاتار 3D</span>
          </button>

          {/* Quick Dialect Selector */}
          <div className="relative hidden md:flex items-center">
            <select
              value={selectedDialect}
              onChange={(e) => onSelectDialect(e.target.value as DialectId)}
              className="appearance-none bg-slate-900 text-slate-200 border border-emerald-500/30 text-xs rounded-xl px-2.5 py-1.5 pr-7 hover:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
              title="اللكنة والمنطقة"
            >
              {DIALECTS.map((d) => (
                <option key={d.id} value={d.id}>
                  🇩🇿 {d.name} ({d.nameAr})
                </option>
              ))}
            </select>
            <Globe className="w-3.5 h-3.5 text-emerald-400 pointer-events-none absolute right-2" />
          </div>

          {/* Auto-TTS Toggle */}
          <button
            onClick={onToggleAutoPlay}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
              autoPlayAudio
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={autoPlayAudio ? 'Audio auto activé' : 'Audio auto désactivé'}
          >
            {autoPlayAudio ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden xl:inline">صوت تلقائي</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden xl:inline">صامت</span>
              </>
            )}
          </button>

          {/* Expressions Guide */}
          <button
            onClick={onOpenExpressions}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 hover:border-emerald-500/40 hover:text-emerald-300 transition"
            title="قاموس العبارات الجزائرية"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-arabic">القاموس</span>
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center p-2 rounded-xl text-xs bg-slate-900 text-slate-300 border border-slate-800 hover:border-emerald-500/40 hover:text-emerald-300 transition"
            title="الإعدادات والخيارات"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
          </button>

          {/* New Chat quick button */}
          <button
            onClick={onClearChat}
            className="flex items-center justify-center p-2 rounded-xl text-xs bg-slate-900 text-slate-400 border border-slate-800 hover:text-red-400 hover:border-red-500/30 transition"
            title="محادثة جديدة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
