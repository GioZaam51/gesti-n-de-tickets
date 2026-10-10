import React, { useState } from 'react';
import {
  X,
  Send,
  Lock,
  MessageSquare,
  Clock,
  User,
  ShieldAlert,
  CheckCircle,
  FileText,
  Paperclip,
  Bookmark,
  Calendar,
  AlertCircle,
  Check,
  ChevronRight,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { TicketStatus, TicketPriority } from '../types/ticket';

export const TicketDetailModal: React.FC = () => {
  const {
    selectedTicket,
    setSelectedTicket,
    updateTicketStatus,
    updateTicketPriority,
    assignTicket,
    addMessage,
    logTime,
    agents,
    cannedResponses,
    knowledgeArticles,
    currentPersona,
  } = useTickets();

  if (!selectedTicket) return null;

  const [composerMode, setComposerMode] = useState<'public_reply' | 'internal_note'>('public_reply');
  const [messageText, setMessageText] = useState('');
  const [showCannedMenu, setShowCannedMenu] = useState(false);
  const [showKbMenu, setShowKbMenu] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; size: string; type: string }[]>([]);

  const handleSendMessage = (andResolve: boolean = false) => {
    if (!messageText.trim() && attachedFiles.length === 0) return;

    addMessage(selectedTicket.id, messageText, composerMode, attachedFiles.length > 0 ? attachedFiles : undefined);
    setMessageText('');
    setAttachedFiles([]);

    if (andResolve) {
      updateTicketStatus(selectedTicket.id, 'resolved');
    }
  };

  const handleSimulateAttachment = () => {
    const mockFiles = [
      { id: `file-${Date.now()}`, name: 'screenshot-error-403.png', size: '420 KB', type: 'image/png' },
      { id: `file-${Date.now()}`, name: 'syslog-output.log', size: '1.2 MB', type: 'text/plain' },
      { id: `file-${Date.now()}`, name: 'recibo-pago-septiembre.pdf', size: '250 KB', type: 'application/pdf' },
    ];
    const picked = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    setAttachedFiles((prev) => [...prev, picked]);
  };

  const handleApplyCanned = (content: string) => {
    setMessageText((prev) => (prev ? `${prev}\n\n${content}` : content));
    setShowCannedMenu(false);
  };

  const handleInsertKbArticle = (article: any) => {
    const text = `Te sugerimos consultar la guía de nuestra base de conocimiento:\n📘 "${article.title}"\n${article.summary}`;
    setMessageText((prev) => (prev ? `${prev}\n\n${text}` : text));
    setShowKbMenu(false);
  };

  const getSlaRemaining = () => {
    if (selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') {
      return { text: 'SLA Cumplido con éxito', isBreached: false, isUrgent: false };
    }
    const diffMs = new Date(selectedTicket.slaDueAt).getTime() - Date.now();
    if (diffMs <= 0) {
      return { text: 'SLA Vencido (Objetivo no cumplido)', isBreached: true, isUrgent: false };
    }
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      text: `${diffHours} horas y ${diffMins} minutos restantes`,
      isBreached: false,
      isUrgent: diffHours < 2,
    };
  };

  const slaInfo = getSlaRemaining();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {selectedTicket.id}
            </span>
            <h2 className="text-base font-semibold truncate text-white">
              {selectedTicket.title}
            </h2>
          </div>

          <button
            onClick={() => setSelectedTicket(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two column grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Main conversation column (2 cols) */}
          <div className="lg:col-span-2 p-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Problem Description Callout */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 mb-6">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      {selectedTicket.requester.name}
                    </span>
                    <span>({selectedTicket.requester.role || 'Solicitante'})</span>
                  </div>
                  <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedTicket.description}
                </p>
                {selectedTicket.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Etiquetas:</span>
                    {selectedTicket.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.2 bg-white text-slate-600 border border-slate-200 rounded font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Thread */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Historial de Respuestas & Mensajes ({selectedTicket.messages.length})
                </h3>

                {selectedTicket.messages.map((msg) => {
                  const isInternal = msg.type === 'internal_note';
                  const isClient = msg.senderRole === 'customer';

                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isInternal
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : isClient
                          ? 'bg-slate-50 border-slate-200 text-slate-900'
                          : 'bg-indigo-50/40 border-indigo-200 text-slate-900'
                      }`}
                    >
                      {/* Message author header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isInternal ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded">
                              <Lock className="w-3 h-3" />
                              Nota Interna (Confidencial)
                            </span>
                          ) : (
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                                isClient
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              {isClient ? 'Solicitante' : 'Soporte TI'}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-slate-800">
                            {msg.senderName}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' · '}
                          {new Date(msg.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-xs leading-relaxed whitespace-pre-line">
                        {msg.content}
                      </p>

                      {/* Attachments if any */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                          {msg.attachments.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-slate-200 text-[11px] text-slate-700 shadow-2xs"
                            >
                              <Paperclip className="w-3 h-3 text-slate-400" />
                              <span className="font-medium truncate max-w-[150px]">{file.name}</span>
                              <span className="text-[10px] text-slate-400">({file.size})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Response Composer */}
            <div className="border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden pt-1">
              {/* Tabs: Public Reply vs Internal Note */}
              <div className="flex items-center justify-between px-3 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setComposerMode('public_reply')}
                    className={`flex items-center gap-1.5 py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
                      composerMode === 'public_reply'
                        ? 'border-indigo-600 text-indigo-700 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Respuesta al Cliente</span>
                  </button>
                  <button
                    onClick={() => setComposerMode('internal_note')}
                    className={`flex items-center gap-1.5 py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
                      composerMode === 'internal_note'
                        ? 'border-amber-600 text-amber-700 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Nota Interna</span>
                  </button>
                </div>

                {/* Quick helpers: Canned responses & Knowledge Base */}
                <div className="flex items-center gap-2 py-1">
                  {/* Canned responses dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowCannedMenu(!showCannedMenu)}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded px-2 py-1 hover:border-slate-300"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Respuesta Rápida</span>
                    </button>
                    {showCannedMenu && (
                      <div className="absolute right-0 bottom-full mb-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-1 z-50 text-xs">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                          Plantillas de respuesta
                        </div>
                        {cannedResponses.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleApplyCanned(item.content)}
                            className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-slate-700 flex flex-col"
                          >
                            <span className="font-semibold text-[11px]">{item.title}</span>
                            <span className="text-[10px] text-slate-400 truncate">{item.category}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* KB Article insertion */}
                  <div className="relative">
                    <button
                      onClick={() => setShowKbMenu(!showKbMenu)}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded px-2 py-1 hover:border-slate-300"
                    >
                      <Bookmark className="w-3 h-3 text-cyan-600" />
                      <span>Vincular Guía</span>
                    </button>
                    {showKbMenu && (
                      <div className="absolute right-0 bottom-full mb-1 w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-1 z-50 text-xs">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                          Artículos de Base de Conocimiento
                        </div>
                        {knowledgeArticles.map((art) => (
                          <button
                            key={art.id}
                            onClick={() => handleInsertKbArticle(art)}
                            className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-slate-700 flex flex-col"
                          >
                            <span className="font-semibold text-[11px] truncate">{art.title}</span>
                            <span className="text-[10px] text-slate-400">{art.category}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <div className="p-3">
                <textarea
                  rows={3}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={
                    composerMode === 'internal_note'
                      ? 'Escriba un comentario visible únicamente para el equipo técnico...'
                      : 'Escriba una respuesta para el cliente...'
                  }
                  className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none"
                />

                {/* Attached files chips */}
                {attachedFiles.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {attachedFiles.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200"
                      >
                        <Paperclip className="w-2.5 h-2.5" />
                        {f.name}
                        <button
                          onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="hover:text-rose-500 ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Composer footer actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={handleSimulateAttachment}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Adjuntar archivo</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {composerMode === 'public_reply' && selectedTicket.status !== 'resolved' && (
                      <button
                        onClick={() => handleSendMessage(true)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                      >
                        Enviar y Resolver
                      </button>
                    )}

                    <button
                      onClick={() => handleSendMessage(false)}
                      disabled={!messageText.trim() && attachedFiles.length === 0}
                      className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow-2xs transition-all flex items-center gap-1.5 ${
                        composerMode === 'internal_note'
                          ? 'bg-amber-600 hover:bg-amber-500 disabled:opacity-50'
                          : 'bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{composerMode === 'internal_note' ? 'Guardar Nota' : 'Enviar Respuesta'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Meta controls, SLA, Requester, Time Log (1 col) */}
          <div className="p-6 bg-slate-50/70 space-y-6">
            {/* Status Control */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Estado del Ticket
              </label>
              <select
                value={selectedTicket.status}
                onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as TicketStatus)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              >
                <option value="open">Abierto (Pendiente)</option>
                <option value="in_progress">En Progreso</option>
                <option value="waiting_client">Esperando Cliente</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>

            {/* Priority Control */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Prioridad
              </label>
              <select
                value={selectedTicket.priority}
                onChange={(e) => updateTicketPriority(selectedTicket.id, e.target.value as TicketPriority)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              >
                <option value="urgent">Urgente (Crítica)</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            {/* Assignee Control */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Técnico Asignado
              </label>
              <select
                value={selectedTicket.assignee ? selectedTicket.assignee.id : ''}
                onChange={(e) => assignTicket(selectedTicket.id, e.target.value || null)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              >
                <option value="">-- Sin asignar --</option>
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.role})
                  </option>
                ))}
              </select>
            </div>

            {/* SLA Countdown Card */}
            <div
              className={`p-3.5 rounded-xl border text-xs ${
                slaInfo.isBreached
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : slaInfo.isUrgent
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Compromiso SLA
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/70">
                  {selectedTicket.priority}
                </span>
              </div>
              <p className="text-[11px] font-medium">{slaInfo.text}</p>
              <div className="text-[10px] opacity-75 mt-1">
                Límite: {new Date(selectedTicket.slaDueAt).toLocaleString()}
              </div>
            </div>

            {/* Time Tracking Widget */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Tiempo Dedicado</span>
                <span className="font-mono text-indigo-600 font-bold">
                  {selectedTicket.timeSpentMinutes || 0} min ({((selectedTicket.timeSpentMinutes || 0) / 60).toFixed(1)}h)
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => logTime(selectedTicket.id, 15)}
                  className="flex-1 py-1 px-2 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  +15m
                </button>
                <button
                  onClick={() => logTime(selectedTicket.id, 30)}
                  className="flex-1 py-1 px-2 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  +30m
                </button>
                <button
                  onClick={() => logTime(selectedTicket.id, 60)}
                  className="flex-1 py-1 px-2 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  +1h
                </button>
              </div>
            </div>

            {/* Requester Information */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
              <span className="font-semibold text-slate-700 block text-xs">
                Datos del Solicitante
              </span>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <div className="font-medium text-slate-900">{selectedTicket.requester.name}</div>
                <div>{selectedTicket.requester.email}</div>
                {selectedTicket.requester.company && (
                  <div className="text-slate-500">{selectedTicket.requester.company}</div>
                )}
                {selectedTicket.requester.phone && (
                  <div className="text-slate-500">{selectedTicket.requester.phone}</div>
                )}
              </div>
            </div>

            {/* Audit Log / Activities */}
            <div>
              <span className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                Auditoría / Registro ({selectedTicket.activities.length})
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-[11px]">
                {selectedTicket.activities.map((act) => (
                  <div key={act.id} className="p-2 bg-white rounded border border-slate-200/70">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-medium text-slate-700">{act.actor}</span>
                      <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-slate-600 mt-0.5">{act.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
