import React from 'react';
import { X, Volume2, Send, BookOpen, Compass } from 'lucide-react';
import { ALGERIAN_EXPRESSIONS, DIALECTS } from '../data/algerianData';
import { AlgerianExpression, DialectId } from '../types';

interface ExpressionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhrase: (phrase: string) => void;
  onSpeakPhrase: (phrase: string) => void;
  selectedDialect: DialectId;
  onSelectDialect: (d: DialectId) => void;
}

export const ExpressionsDrawer: React.FC<ExpressionsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectPhrase,
  onSpeakPhrase,
  selectedDialect,
  onSelectDialect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Dictionnaire & Expressions de Darija</span>
                <span className="font-arabic text-emerald-400 text-sm font-bold">قاموس الدارجة</span>
              </h2>
              <p className="text-xs text-slate-400">
                Découvrez et écoutez les expressions populaires algériennes avec Sawti AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Dialect Quick Filter */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Régions & Variantes dialectales en Algérie :</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {DIALECTS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onSelectDialect(d.id)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition ${
                    selectedDialect === d.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-white">{d.name}</div>
                  <div className="font-arabic text-[11px] text-emerald-400">{d.nameAr}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-300">
            Expressions populaires & contextes d'usage :
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALGERIAN_EXPRESSIONS.map((item, index) => (
              <div
                key={index}
                className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                      {item.region}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{item.arabizi}</span>
                  </div>

                  <h3 className="font-arabic text-xl font-bold text-white text-right mb-1">
                    {item.phraseAr}
                  </h3>

                  <p className="text-xs text-slate-300 font-medium mb-1">{item.meaningFr}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.usageContext}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSpeakPhrase(item.phraseAr)}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium p-1 rounded-lg hover:bg-emerald-950/40 transition"
                    title="Écouter la prononciation"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Écouter (TTS)</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectPhrase(`فهم لي بالتفصيل معنى عبارة "${item.phraseAr}" وكيفاش نستعملوها في دزاير`);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                    title="Demander à Sawti AI"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Demander</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
