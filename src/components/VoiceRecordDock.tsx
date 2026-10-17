import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Send,
  Upload,
  X,
  Volume2,
  Sparkles,
  Paperclip,
  Check,
  RotateCcw,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { AudioRecorderController, createAudioRecorder, formatTime } from '../utils/audio';

interface VoiceRecordDockProps {
  onSendVoice: (audioBase64: string, mimeType: string, duration: number) => Promise<void>;
  onSendText: (text: string) => Promise<void>;
  isLoading: boolean;
  selectedDialectName: string;
  onRecordingChange?: (isRecording: boolean) => void;
}

export const VoiceRecordDock: React.FC<VoiceRecordDockProps> = ({
  onSendVoice,
  onSendText,
  isLoading,
  selectedDialectName,
  onRecordingChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorderController | null>(null);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Timer loop when recording
  useEffect(() => {
    if (isRecording) {
      setRecordDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => {
          if (prev >= 119) {
            handleStopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      setRecordingError(null);
      const recorder = await createAudioRecorder();
      recorderRef.current = recorder;
      setAudioAnalyser(recorder.getAnalyser());
      await recorder.start();
      setIsRecording(true);
      onRecordingChange?.(true);
    } catch (err: any) {
      console.error('Mic access error:', err);
      setRecordingError(
        'Impossible d\'accéder au microphone. Veuillez autoriser l\'accès dans votre navigateur.'
      );
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current || !isRecording) return;
    try {
      setIsRecording(false);
      onRecordingChange?.(false);
      const result = await recorderRef.current.stop();
      recorderRef.current = null;
      setAudioAnalyser(null);

      if (result.duration >= 1) {
        await onSendVoice(result.base64, result.mimeType, result.duration);
      }
    } catch (err: any) {
      console.error('Stop recording error:', err);
      setRecordingError('Erreur lors de l\'enregistrement de votre voix.');
    }
  };

  const handleCancelRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    setIsRecording(false);
    onRecordingChange?.(false);
    setAudioAnalyser(null);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isLoading) return;
    const msg = textInput.trim();
    setTextInput('');
    await onSendText(msg);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setRecordingError('Veuillez sélectionner un fichier audio valide (.wav, .mp3, .m4a, .webm).');
      return;
    }

    try {
      setRecordingError(null);
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || result;
        await onSendVoice(base64, file.type, 10);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setRecordingError('Erreur lors de la lecture du fichier audio.');
    }
  };

  return (
    <div className="border-t border-emerald-500/20 bg-slate-950/95 backdrop-blur-xl p-3 sm:p-4 sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        {/* Error notification banner */}
        {recordingError && (
          <div className="bg-red-950/80 border border-red-500/40 text-red-200 text-xs px-3 py-2 rounded-xl flex items-center justify-between">
            <span>{recordingError}</span>
            <button onClick={() => setRecordingError(null)} className="p-1 text-red-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ACTIVE RECORDING STATE */}
        {isRecording ? (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  تسجيل صوتي جارٍ ({selectedDialectName})...
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {formatTime(recordDuration)}
              </span>
            </div>

            {/* Live Audio Visualizer */}
            <AudioVisualizer analyser={audioAnalyser} isRecording={true} barCount={40} />

            {/* Control buttons */}
            <div className="flex items-center justify-center gap-4 pt-1">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleCancelRecording}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-red-300 hover:bg-red-950/60 hover:text-red-200 border border-red-500/30 transition"
              >
                <X className="w-4 h-4" />
                <span>إلغاء (Annuler)</span>
              </button>

              {/* Stop & Transcribe Button */}
              <button
                type="button"
                onClick={handleStopRecording}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-700/40 transition transform active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>إرسال وتحليل الصوت</span>
              </button>
            </div>
          </div>
        ) : (
          /* IDLE / TEXT & MIC INPUT INTERFACE */
          <div className="flex flex-col gap-2">
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
              {/* File upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="تحميل ملف صوتي (WhatsApp, mp3, wav)"
                className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/25 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition shrink-0"
              >
                <Upload className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Text Input (Arabic Darija or Arabizi) */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="أكتب بالدارجة أو اضغط على الميكروفون وتكلم..."
                  dir="auto"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-3.5 border border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-400 text-sm font-arabic transition shadow-inner"
                />
              </div>

              {/* Central Primary Mic Button */}
              <button
                type="button"
                onClick={handleStartRecording}
                disabled={isLoading}
                title="تكلم بصوتك بالدارجة الجزائرية"
                className="relative group p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-900/40 hover:shadow-emerald-700/60 border border-emerald-300/40 transition transform active:scale-95 shrink-0"
              >
                <Mic className="w-5 h-5 group-hover:scale-110 transition duration-200" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
              </button>

              {/* Send Text Button */}
              {textInput.trim() && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition transform active:scale-95 shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </form>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Reconnaissance : <strong>gemini-3.5-transcribe</strong> | Synthèse : <strong>gemini-3.8-flash-tts</strong></span>
              </span>
              <span className="hidden sm:inline font-arabic text-emerald-300">
                هدر بطبيعتك، صوتي يفهم قاع ولايات دزاير 🇩🇿
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
