import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  MessageSquare,
  Globe,
  Radio,
  Bot,
  ChevronUp,
  ChevronDown,
  Play,
  RotateCcw,
  Zap,
  Sliders,
  PanelRightClose,
  PanelRight,
} from 'lucide-react';
import { Header } from './components/Header';
import { MessageItem } from './components/MessageItem';
import { VoiceRecordDock } from './components/VoiceRecordDock';
import { ExpressionsDrawer } from './components/ExpressionsDrawer';
import { SettingsModal } from './components/SettingsModal';
import { SessionsSidebar } from './components/SessionsSidebar';
import { Avatar3D } from './components/Avatar3D';
import { ChatMessage, ChatSession, DialectId, VoiceId, AvatarState } from './types';
import { DIALECTS, VOICES, QUICK_PROMPTS } from './data/algerianData';
import {
  loadSessionsFromStorage,
  saveSessionsToStorage,
  getActiveSessionIdFromStorage,
  setActiveSessionIdInStorage,
  createNewSession,
  deriveSessionTitle,
} from './utils/storage';

export default function App() {
  // 1. Sessions State with LocalStorage Persistence
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const loaded = loadSessionsFromStorage();
    if (loaded && loaded.length > 0) {
      return loaded;
    }
    const initial = createNewSession('general', 'Kore');
    saveSessionsToStorage([initial]);
    return [initial];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const storedActive = getActiveSessionIdFromStorage();
    if (storedActive && sessions.some((s) => s.id === storedActive)) {
      return storedActive;
    }
    return sessions[0]?.id || '';
  });

  // Current Active Session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  // 2. Preferences & Audio State
  const [selectedDialect, setSelectedDialect] = useState<DialectId>(activeSession?.dialect || 'general');
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>(activeSession?.voice || 'Kore');
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [enableSearch, setEnableSearch] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // 3. UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExpressionsOpen, setIsExpressionsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);

  // 4. Audio Player Ref
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio();
    audio.playbackRate = playbackSpeed;
    audio.onended = () => setActivePlayingId(null);
    audio.onerror = () => setActivePlayingId(null);
    audioPlayerRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sync activeSessionId to storage
  useEffect(() => {
    if (activeSessionId) {
      setActiveSessionIdInStorage(activeSessionId);
    }
  }, [activeSessionId]);

  // Sync sessions changes to storage
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessionsToStorage(sessions);
    }
  }, [sessions]);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Determine Avatar 3D Emotion / State
  let avatarState: AvatarState = 'idle';
  if (isVoiceRecording) {
    avatarState = 'listening';
  } else if (isLoading) {
    avatarState = 'thinking';
  } else if (activePlayingId !== null) {
    avatarState = 'speaking';
  }

  // Helper to update current session messages and auto-derive title
  const updateActiveSessionMessages = (
    updater: (prevMsgs: ChatMessage[]) => ChatMessage[]
  ) => {
    setSessions((prevSessions) => {
      return prevSessions.map((sess) => {
        if (sess.id === activeSessionId) {
          const newMessages = updater(sess.messages);
          const newTitle =
            sess.title === 'محادثة جديدة (Nouvelle session)' || sess.title.startsWith('محادثة')
              ? deriveSessionTitle(newMessages)
              : sess.title;

          return {
            ...sess,
            messages: newMessages,
            title: newTitle,
            updatedAt: Date.now(),
            dialect: selectedDialect,
            voice: selectedVoice,
          };
        }
        return sess;
      });
    });
  };

  // Switch session
  const handleSelectSession = (sessionId: string) => {
    handleStopAudio();
    setActiveSessionId(sessionId);
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      setSelectedDialect(target.dialect || 'general');
      setSelectedVoice(target.voice || 'Kore');
    }
  };

  // New Chat session
  const handleNewSession = () => {
    handleStopAudio();
    const newSess = createNewSession(selectedDialect, selectedVoice);
    setSessions((prev) => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
  };

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    handleStopAudio();
    const updated = sessions.filter((s) => s.id !== sessionId);
    if (updated.length === 0) {
      const brandNew = createNewSession(selectedDialect, selectedVoice);
      setSessions([brandNew]);
      setActiveSessionId(brandNew.id);
    } else {
      setSessions(updated);
      if (activeSessionId === sessionId) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  // Rename session
  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  // Play audio response with gemini-3.8-flash-tts
  const handlePlayAudio = async (messageId: string, textToSpeak: string) => {
    if (!audioPlayerRef.current) return;

    if (activePlayingId === messageId) {
      audioPlayerRef.current.pause();
      setActivePlayingId(null);
      return;
    }

    audioPlayerRef.current.pause();

    const targetMsg = messages.find((m) => m.id === messageId);

    if (targetMsg?.audioUrl) {
      audioPlayerRef.current.src = targetMsg.audioUrl;
      audioPlayerRef.current.playbackRate = playbackSpeed;
      setActivePlayingId(messageId);
      audioPlayerRef.current.play().catch((err) => {
        console.error('Audio play error:', err);
        setActivePlayingId(null);
      });
      return;
    }

    try {
      updateActiveSessionMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isAudioLoading: true } : m))
      );

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          voiceName: selectedVoice,
          style: `Authentic Algerian Darija accent, friendly cadence (${selectedDialect})`,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.audioBase64) {
        throw new Error(data.error || 'Failed to generate speech');
      }

      const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;

      updateActiveSessionMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, audioUrl, audioBase64: data.audioBase64, isAudioLoading: false }
            : m
        )
      );

      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.playbackRate = playbackSpeed;
      setActivePlayingId(messageId);
      audioPlayerRef.current.play().catch((err) => {
        console.error('Audio play error:', err);
        setActivePlayingId(null);
      });
    } catch (err) {
      console.error('TTS error:', err);
      updateActiveSessionMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isAudioLoading: false } : m))
      );
      setActivePlayingId(null);
    }
  };

  const handleStopAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setActivePlayingId(null);
  };

  // Speak standalone phrase (from dictionary or 3D avatar interaction)
  const handleSpeakPhrase = async (phrase: string) => {
    if (!audioPlayerRef.current) return;
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: phrase,
          voiceName: selectedVoice,
        }),
      });
      const data = await res.json();
      if (data.success && data.audioBase64) {
        audioPlayerRef.current.src = `data:audio/wav;base64,${data.audioBase64}`;
        audioPlayerRef.current.playbackRate = playbackSpeed;
        setActivePlayingId('temp-phrase');
        audioPlayerRef.current.play();
      }
    } catch (e) {
      console.error('Phrase TTS failed', e);
    }
  };

  // Interactive Avatar Click
  const handleAvatarGreeting = () => {
    handleSpeakPhrase('سلام عليكم يا خويا، واش راك لاباس؟ أنا صوتي في الخدمة!');
  };

  // Send Voice note (STT -> NLP -> TTS)
  const handleSendVoice = async (audioBase64: string, mimeType: string, duration: number) => {
    const userMsgId = 'user-' + Date.now();
    const userAudioUrl = `data:${mimeType};base64,${audioBase64}`;

    const initialUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      timestamp: Date.now(),
      text: '🎙️ جاري الاستماع وتفريغ الصوت بالدارجة...',
      userAudioUrl,
    };

    updateActiveSessionMessages((prev) => [...prev, initialUserMsg]);
    setIsLoading(true);

    try {
      const sttRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          dialect: selectedDialect,
        }),
      });

      const sttData = await sttRes.json();
      if (!sttData.success || !sttData.text) {
        throw new Error(sttData.error || 'Transcription failed');
      }

      const transcribedText = sttData.text;

      updateActiveSessionMessages((prev) =>
        prev.map((m) =>
          m.id === userMsgId
            ? { ...m, text: transcribedText, arabizi: sttData.arabizi || '' }
            : m
        )
      );

      await processNlpResponse(transcribedText);
    } catch (err: any) {
      console.error('Voice processing pipeline error:', err);
      updateActiveSessionMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'model',
          timestamp: Date.now(),
          text: `سمحلي، صرا مشكل خفيف في تفريغ الصوت: ${err.message || 'حاول مرة أخرى'}. تقدر تعاود ولا تكتب عادي.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Text query
  const handleSendText = async (text: string) => {
    const userMsgId = 'user-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      timestamp: Date.now(),
      text,
    };

    updateActiveSessionMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      await processNlpResponse(text);
    } catch (err: any) {
      console.error('Chat error:', err);
      updateActiveSessionMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'model',
          timestamp: Date.now(),
          text: `سمحلي صرا مشكل تقني: ${err.message}. عاود جرب بعد لحظات.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Process NLP & synthesize speech
  const processNlpResponse = async (userPrompt: string) => {
    const historyPayload = messages
      .filter((m) => !m.id.startsWith('welcome-') && !m.id.startsWith('error-'))
      .map((m) => ({
        role: m.role,
        text: m.text,
      }));

    const chatRes = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userPrompt,
        history: historyPayload,
        dialect: selectedDialect,
        enableSearch,
      }),
    });

    const chatData = await chatRes.json();
    if (!chatData.success) {
      throw new Error(chatData.error || 'Failed to generate response');
    }

    const modelMsgId = 'model-' + Date.now();
    const newModelMsg: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      timestamp: Date.now(),
      text: chatData.reply,
      arabizi: chatData.arabizi,
      sources: chatData.sources || [],
      quickSuggestions: chatData.quickSuggestions || [],
      dialect: selectedDialect,
    };

    updateActiveSessionMessages((prev) => [...prev, newModelMsg]);

    if (autoPlayAudio) {
      try {
        const speechText = chatData.summaryForSpeech || chatData.reply;
        const ttsRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: speechText,
            voiceName: selectedVoice,
            style: `Natural Algerian Darija, ${selectedDialect} cadence`,
          }),
        });

        const ttsData = await ttsRes.json();
        if (ttsData.success && ttsData.audioBase64) {
          const audioUrl = `data:audio/wav;base64,${ttsData.audioBase64}`;
          updateActiveSessionMessages((prev) =>
            prev.map((m) =>
              m.id === modelMsgId
                ? { ...m, audioUrl, audioBase64: ttsData.audioBase64 }
                : m
            )
          );

          if (audioPlayerRef.current) {
            audioPlayerRef.current.src = audioUrl;
            audioPlayerRef.current.playbackRate = playbackSpeed;
            setActivePlayingId(modelMsgId);
            audioPlayerRef.current.play().catch((e) => {
              console.log('Autoplay audio blocked or interrupted:', e);
              setActivePlayingId(null);
            });
          }
        }
      } catch (ttsErr) {
        console.error('Auto TTS error:', ttsErr);
      }
    }
  };

  const currentDialectObj = DIALECTS.find((d) => d.id === selectedDialect) || DIALECTS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Header */}
      <Header
        selectedDialect={selectedDialect}
        onSelectDialect={setSelectedDialect}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        autoPlayAudio={autoPlayAudio}
        onToggleAutoPlay={() => setAutoPlayAudio(!autoPlayAudio)}
        onOpenExpressions={() => setIsExpressionsOpen(true)}
        onClearChat={handleNewSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sessionsCount={sessions.length}
        showAvatar={showAvatar}
        onToggleAvatar={() => setShowAvatar(!showAvatar)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Left: Sessions Sidebar (LocalStorage Persistence) */}
        <SessionsSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Center: Conversation & Record Dock */}
        <div className="flex-1 flex flex-col h-[calc(100vh-65px)] min-w-0 overflow-hidden">
          {/* MOBILE/TABLET STICKY 3D AVATAR STAGE (Visible at top on smaller screens, never scrolled away!) */}
          {showAvatar && (
            <div className="lg:hidden border-b border-emerald-500/20 bg-slate-950/95 backdrop-blur-md px-3 py-2 flex items-center justify-between shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 shrink-0 bg-slate-900 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-inner">
                  <Avatar3D
                    state={avatarState}
                    onAvatarClick={handleAvatarGreeting}
                    className="w-full h-full"
                  />
                </div>
                <div className="text-right" dir="rtl">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        avatarState === 'listening'
                          ? 'bg-rose-500 animate-pulse'
                          : avatarState === 'thinking'
                          ? 'bg-sky-400 animate-pulse'
                          : avatarState === 'speaking'
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span className="text-[11px] font-bold text-slate-200">
                      {avatarState === 'listening'
                        ? 'يستمع إليك...'
                        : avatarState === 'thinking'
                        ? 'يحلل بالدارجة...'
                        : avatarState === 'speaking'
                        ? 'يتحدث بالصوت...'
                        : 'صوتي 3D متصل'}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-arabic font-semibold">
                    🇩🇿 {currentDialectObj.nameAr}
                  </div>
                  <button
                    onClick={handleAvatarGreeting}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 mt-0.5"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>انقر على الأفاتار للتحية</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowAvatar(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900"
                title="إخفاء الأفاتار"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Messages Stream (Scrolls smoothly beneath the stage) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-4">
            {/* Quick Prompts Chips on Empty / Welcome State */}
            {messages.length <= 2 && (
              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5" dir="rtl">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-arabic">جرّب أسئلة ومواضيع جزائرية شائعة :</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendText(prompt.ar)}
                      className="bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 p-3 rounded-2xl text-right transition flex flex-col justify-between group shadow-sm"
                    >
                      <span className="text-[10px] font-bold text-emerald-400 mb-1">
                        {prompt.label}
                      </span>
                      <span className="font-arabic text-sm text-slate-200 group-hover:text-white font-medium">
                        {prompt.ar}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 line-clamp-1">
                        {prompt.arabizi}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Feed */}
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  isPlaying={activePlayingId === msg.id}
                  onPlayAudio={handlePlayAudio}
                  onStopAudio={handleStopAudio}
                  onSelectSuggestion={(sugg) => handleSendText(sugg)}
                  selectedVoice={selectedVoice}
                />
              ))}

              {/* Assistant Thinking / Transcribing Indicator */}
              {isLoading && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/25 max-w-sm animate-pulse">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Mic className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-arabic">
                      صوتي يحلل ويفكر بالدارجة...
                    </div>
                    <div className="text-[11px] text-emerald-400/80">
                      Reconnaissance vocale & génération audio
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Voice Record Dock */}
          <VoiceRecordDock
            onSendVoice={handleSendVoice}
            onSendText={handleSendText}
            isLoading={isLoading}
            selectedDialectName={currentDialectObj.name}
            onRecordingChange={setIsVoiceRecording}
          />
        </div>

        {/* Right Column: DEDICATED DESKTOP 3D AVATAR COMPANION STAGE (Always fixed & visible on lg screens!) */}
        {showAvatar && (
          <aside className="hidden lg:flex w-96 flex-col border-l border-emerald-500/20 bg-slate-950/80 backdrop-blur-xl p-5 overflow-y-auto shrink-0 shadow-2xl">
            {/* 3D Canvas Box */}
            <div className="relative w-full h-80 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border border-emerald-500/30 overflow-hidden shadow-2xl flex flex-col items-center justify-center group">
              {/* Soft ambient back light */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Real-time WebGL Avatar */}
              <Avatar3D
                state={avatarState}
                onAvatarClick={handleAvatarGreeting}
                className="w-full h-full"
              />

              {/* Interactive Click Tip */}
              <div className="absolute bottom-2.5 px-3 py-1 rounded-full bg-slate-950/80 border border-emerald-500/30 text-[11px] text-slate-300 font-arabic flex items-center gap-1.5 shadow-md">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>اضغط على الأفاتار للتحية بالصوت</span>
              </div>
            </div>

            {/* Avatar Profile & Live Status */}
            <div className="mt-4 flex flex-col gap-3 text-right" dir="rtl">
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition ${
                    avatarState === 'listening'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : avatarState === 'thinking'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 animate-pulse'
                      : avatarState === 'speaking'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  <span>
                    {avatarState === 'listening'
                      ? 'يستمع إليك الآن...'
                      : avatarState === 'thinking'
                      ? 'يفكر ويحلل بالدارجة...'
                      : avatarState === 'speaking'
                      ? 'يتحدث بالصوت (TTS)...'
                      : 'صوتي 3D متصل وجاهز'}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  Gemini 3.8
                </span>
              </div>

              <div>
                <h3 className="font-arabic text-lg font-extrabold text-white">
                  صوتي — الرفيق الذكي 3D
                </h3>
                <p className="font-arabic text-xs text-slate-300 mt-1 leading-relaxed">
                  يتفاعل ويستمع إليك بالدارجة الجزائرية الأصيلة. ينطق الإجابات بصوت واقعي عبر{' '}
                  <span className="text-emerald-400 font-mono">gemini-3.8-flash-tts</span>.
                </p>
              </div>

              {/* Dialect Quick Pill */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div className="text-right">
                  <div className="text-slate-400 text-[10px]">المنطقة واللهجة المختارة</div>
                  <div className="font-arabic font-bold text-white text-xs">
                    🇩🇿 {currentDialectObj.name}
                  </div>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold"
                >
                  تغيير
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={handleAvatarGreeting}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-arabic font-bold text-xs shadow-md shadow-emerald-950/40 transition active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>تحية صوتية</span>
                </button>

                <button
                  onClick={() => setIsExpressionsOpen(true)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-arabic font-semibold transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>القاموس</span>
                </button>
              </div>

              {/* Developer Credit Card */}
              <div className="mt-2 p-2.5 rounded-2xl bg-slate-900/60 border border-emerald-500/20 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-arabic">طُوِّر بواسطة المهندسة :</span>
                <span className="font-bold text-emerald-400">BENABOUD ROQIA 🇩🇿</span>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Algerian Expressions Dictionary Modal */}
      <ExpressionsDrawer
        isOpen={isExpressionsOpen}
        onClose={() => setIsExpressionsOpen(false)}
        onSelectPhrase={(phrase) => handleSendText(phrase)}
        onSpeakPhrase={handleSpeakPhrase}
        selectedDialect={selectedDialect}
        onSelectDialect={setSelectedDialect}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedDialect={selectedDialect}
        onSelectDialect={setSelectedDialect}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        enableSearch={enableSearch}
        onToggleSearch={() => setEnableSearch(!enableSearch)}
        playbackSpeed={playbackSpeed}
        onChangePlaybackSpeed={setPlaybackSpeed}
      />
    </div>
  );
}
