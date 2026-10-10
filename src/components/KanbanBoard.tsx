import React from 'react';
import {
  MessageSquare,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Plus,
  MoreVertical,
  CheckCircle,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { Ticket, TicketStatus, TicketPriority } from '../types/ticket';

const COLUMNS: { id: TicketStatus; label: string; headerColor: string; dotColor: string }[] = [
  { id: 'open', label: 'Abierto', headerColor: 'text-blue-700 bg-blue-50/70 border-blue-200', dotColor: 'bg-blue-500' },
  { id: 'in_progress', label: 'En Progreso', headerColor: 'text-indigo-700 bg-indigo-50/70 border-indigo-200', dotColor: 'bg-indigo-500' },
  { id: 'waiting_client', label: 'En Espera de Cliente', headerColor: 'text-amber-700 bg-amber-50/70 border-amber-200', dotColor: 'bg-amber-500' },
  { id: 'resolved', label: 'Resuelto', headerColor: 'text-emerald-700 bg-emerald-50/70 border-emerald-200', dotColor: 'bg-emerald-500' },
  { id: 'closed', label: 'Cerrado', headerColor: 'text-slate-600 bg-slate-100 border-slate-200', dotColor: 'bg-slate-400' },
];

export const KanbanBoard: React.FC = () => {
  const { filteredTickets, setSelectedTicket, updateTicketStatus, setIsCreateModalOpen } = useTickets();

  const getPriorityStyle = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', label: 'Urgente' };
      case 'high':
        return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Alta' };
      case 'medium':
        return { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', label: 'Media' };
      case 'low':
        return { text: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', label: 'Baja' };
    }
  };

  const getSlaRemainingText = (slaDueAt: string, status: TicketStatus) => {
    if (status === 'resolved' || status === 'closed') {
      return { text: 'SLA Cumplido', isBreached: false, isWarning: false };
    }
    const diffMs = new Date(slaDueAt).getTime() - Date.now();
    if (diffMs <= 0) {
      return { text: 'SLA Vencido', isBreached: true, isWarning: false };
    }
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 2) {
      return { text: `${diffHours}h ${diffMins}m restan`, isBreached: false, isWarning: true };
    }
    return { text: `${diffHours}h restan`, isBreached: false, isWarning: false };
  };

  const getNextStatus = (current: TicketStatus): TicketStatus | null => {
    if (current === 'open') return 'in_progress';
    if (current === 'in_progress') return 'waiting_client';
    if (current === 'waiting_client') return 'resolved';
    if (current === 'resolved') return 'closed';
    return null;
  };

  const getPrevStatus = (current: TicketStatus): TicketStatus | null => {
    if (current === 'closed') return 'resolved';
    if (current === 'resolved') return 'in_progress';
    if (current === 'waiting_client') return 'in_progress';
    if (current === 'in_progress') return 'open';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start pb-12">
      {COLUMNS.map((column) => {
        const columnTickets = filteredTickets.filter((t) => t.status === column.id);

        return (
          <div
            key={column.id}
            className="flex flex-col bg-slate-100/80 rounded-xl border border-slate-200/90 shadow-2xs min-h-[480px] overflow-hidden"
          >
            {/* Column Header */}
            <div className={`px-3.5 py-3 border-b flex items-center justify-between ${column.headerColor}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`}></span>
                <span className="font-semibold text-xs tracking-tight">{column.label}</span>
                <span className="text-[11px] font-bold px-1.5 py-0.2 bg-white/70 rounded-full text-slate-700 shadow-2xs">
                  {columnTickets.length}
                </span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                title="Crear ticket en esta categoría"
                className="p-1 hover:bg-white/60 rounded-md transition-colors text-slate-600 hover:text-slate-900"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Ticket Cards List */}
            <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[75vh]">
              {columnTickets.length === 0 ? (
                <div className="h-36 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-lg p-4 text-center">
                  <span>Sin tickets</span>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium text-[11px] hover:underline"
                  >
                    + Crear ticket
                  </button>
                </div>
              ) : (
                columnTickets.map((ticket) => {
                  const priorityInfo = getPriorityStyle(ticket.priority);
                  const sla = getSlaRemainingText(ticket.slaDueAt, ticket.status);
                  const nextStatus = getNextStatus(ticket.status);
                  const prevStatus = getPrevStatus(ticket.status);

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="group bg-white rounded-lg p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all cursor-pointer relative"
                    >
                      {/* Top card metadata: ID & Priority */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
                          {ticket.id}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}
                        >
                          {priorityInfo.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-950 line-clamp-2 mb-1.5 leading-snug">
                        {ticket.title}
                      </h4>

                      {/* Category & Department */}
                      <div className="text-[11px] text-slate-500 mb-2 flex items-center gap-1.5">
                        <span className="font-medium text-slate-600">{ticket.department}</span>
                        <span>·</span>
                        <span className="capitalize">{ticket.category}</span>
                      </div>

                      {/* Requester name */}
                      <div className="text-[11px] text-slate-500 mb-3 truncate flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{ticket.requester.name}</span>
                      </div>

                      {/* Card Footer: SLA, comments & Assignee */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        {/* SLA Indicator */}
                        <div
                          className={`flex items-center gap-1 text-[10px] font-medium ${
                            sla.isBreached
                              ? 'text-rose-600 font-semibold'
                              : sla.isWarning
                              ? 'text-amber-600 font-semibold'
                              : 'text-slate-500'
                          }`}
                          title={`Límite SLA: ${new Date(ticket.slaDueAt).toLocaleString()}`}
                        >
                          {sla.isBreached ? (
                            <ShieldAlert className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{sla.text}</span>
                        </div>

                        {/* Right: Message count & Assignee Avatar */}
                        <div className="flex items-center gap-2">
                          {ticket.messages.length > 0 && (
                            <div className="flex items-center gap-0.5 text-[10px] text-slate-400">
                              <MessageSquare className="w-3 h-3" />
                              <span>{ticket.messages.length}</span>
                            </div>
                          )}

                          {ticket.assignee ? (
                            <img
                              src={ticket.assignee.avatar}
                              alt={ticket.assignee.name}
                              title={`Asignado a: ${ticket.assignee.name}`}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <span
                              title="Sin asignar"
                              className="w-5 h-5 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 font-bold"
                            >
                              ?
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Move Action buttons on hover */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {prevStatus ? (
                          <button
                            onClick={() => updateTicketStatus(ticket.id, prevStatus)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded text-[10px] flex items-center gap-1"
                            title="Mover a etapa previa"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        ) : (
                          <div></div>
                        )}

                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Ver Detalle
                        </button>

                        {nextStatus ? (
                          <button
                            onClick={() => updateTicketStatus(ticket.id, nextStatus)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded text-[10px] flex items-center gap-1"
                            title="Avanzar etapa"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <div></div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
