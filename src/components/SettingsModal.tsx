import React from 'react';
import { X, Sliders, Globe, Volume2, Search, Check } from 'lucide-react';
import { DialectId, VoiceId } from '../types';
import { DIALECTS, VOICES } from '../data/algerianData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDialect: DialectId;
  onSelectDialect: (d: DialectId) => void;
  selectedVoice: VoiceId;
  onSelectVoice: (v: VoiceId) => void;
  enableSearch: boolean;
  onToggleSearch: () => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedDialect,
  onSelectDialect,
  selectedVoice,
  onSelectVoice,
  enableSearch,
  onToggleSearch,
  playbackSpeed,
  onChangePlaybackSpeed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Paramètres & Voix</h2>
              <p className="text-xs text-slate-400">Configuration dialectale et vocale de Sawti AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Dialect Region */}
          <div>
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Accent & Dialecte régional (الدارجة) :</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DIALECTS.map((d) => {
                const isSelected = selectedDialect === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => onSelectDialect(d.id)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{d.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="font-arabic text-xs text-emerald-400 text-right mt-1">
                      {d.nameAr}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                      {d.region}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Model (TTS) */}
          <div>
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Voix de synthèse (gemini-3.8-flash-tts) :</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VOICES.map((v) => {
                const isSelected = selectedVoice === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onSelectVoice(v.id)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{v.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">{v.tone}</span>
                    <span className="text-[10px] text-slate-400 block mt-1 line-clamp-2">
                      {v.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Search Grounding */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Recherche Web en Direct (Google Search)</div>
                <div className="text-[11px] text-slate-400">
                  Permet à Sawti de vérifier le cours du Square, la météo, la Ligue 1, etc.
                </div>
              </div>
            </div>
            <button
              onClick={onToggleSearch}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                enableSearch ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition"></div>
            </button>
          </div>

          {/* Playback speed */}
          <div>
            <label className="text-xs font-bold text-slate-200 block mb-2">
              Vitesse de lecture audio :
            </label>
            <div className="flex items-center gap-2">
              {[0.8, 1.0, 1.2, 1.4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangePlaybackSpeed(spd)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    playbackSpeed === spd
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Developer & Project Info */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>🇩🇿 Sawti AI (صوتي)</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-mono">
                v2.0 3D
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Chatbot vocal intelligent en Darija algérienne avec Avatar 3D interactif, reconnaissance vocale et synthèse vocale.
            </p>
            <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-arabic">طُوِّر بواسطة المهندسة :</span>
              <span className="font-bold text-emerald-400">BENABOUD ROQIA</span>
            </div>
            <div className="text-[10px] text-slate-500 text-right mt-0.5">
              Université d'Oum El Bouaghi (Algérie)
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
          >
            Terminer
          </button>
        </div>
      </div>
    </div>
  );
};
