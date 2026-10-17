import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  Download,
  Search,
  Compass,
} from 'lucide-react';
import { ChatSession } from '../types';
import { DIALECTS } from '../data/algerianData';
import { exportSessionsAsJson } from '../utils/storage';

interface SessionsSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionsSidebar: React.FC<SessionsSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.messages.some((m) => m.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const startEditing = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveEditing = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 2) return 'الآن';
    if (mins < 60) return `منذ ${mins} د`;
    if (hours < 24) return `منذ ${hours} س`;
    if (days === 1) return 'البارحة';
    if (days < 7) return `منذ ${days} أيام`;
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getDialectName = (dialectId: string) => {
    const d = DIALECTS.find((item) => item.id === dialectId);
    return d ? d.nameAr : 'عامة';
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-80 bg-slate-950/95 border-r border-emerald-500/20 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 lg:z-10`}
      >
        {/* Header */}
        <div className="p-4 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>سجل المحادثات</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                  {sessions.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Sessions sauvegardées (LocalStorage)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action: New Chat Button */}
        <div className="p-3 border-b border-slate-800/80">
          <button
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition transform active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="font-arabic">محادثة جديدة (Nouvelle discussion)</span>
          </button>

          {/* Search Input */}
          <div className="relative mt-2.5">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث في المحادثات..."
              dir="auto"
              className="w-full bg-slate-900 text-slate-200 placeholder-slate-500 rounded-xl pl-8 pr-3 py-1.5 text-xs border border-slate-800 focus:outline-none focus:border-emerald-500/60 font-arabic"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs font-arabic">
              {searchTerm ? 'لا توجد محادثات تطابق البحث' : 'لا توجد محادثات سابقة حتى الآن'}
            </div>
          ) : (
            filteredSessions.map((s) => {
              const isActive = s.id === activeSessionId;
              const isEditing = editingId === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectSession(s.id);
                      if (window.innerWidth < 1024) onClose();
                    }
                  }}
                  className={`group relative p-3 rounded-2xl cursor-pointer transition flex flex-col gap-1.5 border ${
                    isActive
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900/40 hover:bg-slate-900 border-transparent hover:border-slate-800'
                  }`}
                >
                  {/* Title & Editing */}
                  <div className="flex items-center justify-between gap-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 bg-slate-950 text-white text-xs px-2 py-1 rounded-lg border border-emerald-500 focus:outline-none font-arabic"
                          autoFocus
                        />
                        <button
                          onClick={(e) => saveEditing(s.id, e)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <MessageSquare
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'
                            }`}
                          />
                          <span
                            dir="auto"
                            className={`font-arabic text-xs font-medium truncate ${
                              isActive ? 'text-emerald-200 font-bold' : 'text-slate-300'
                            }`}
                          >
                            {s.title}
                          </span>
                        </div>

                        {/* Action buttons (Rename & Delete) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                          <button
                            onClick={(e) => startEditing(s, e)}
                            title="إعادة تسمية"
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
                                onDeleteSession(s.id);
                              }
                            }}
                            title="حذف المحادثة"
                            className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Metadata footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span className="font-arabic text-emerald-400/80">
                      🇩🇿 {getDialectName(s.dialect)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>{s.messages.length} رسالة</span>
                      <span>•</span>
                      <span>{formatTimestamp(s.updatedAt || s.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Export */}
        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => exportSessionsAsJson(sessions)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition"
            title="تصدير جميع المحادثات كملف JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير (Export JSON)</span>
          </button>
          <span className="text-[10px] text-slate-500">Sauvegardé localement</span>
        </div>
      </aside>
    </>
  );
};
