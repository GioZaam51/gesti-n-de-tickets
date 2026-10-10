import React from 'react';
import {
  Users,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export const TeamDirectoryView: React.FC = () => {
  const { agents, tickets, setViewMode, setFilters } = useTickets();

  const getStatusBadge = (status: 'available' | 'busy' | 'away') => {
    switch (status) {
      case 'available':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Disponible
          </span>
        );
      case 'busy':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            En Atención
          </span>
        );
      case 'away':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Ausente
          </span>
        );
    }
  };

  const handleViewAgentTickets = (agentId: string) => {
    setViewMode('list');
    setFilters((prev) => ({
      ...prev,
      assigneeId: agentId,
      status: 'all',
    }));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Estructura Organizacional
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Equipo Técnico & Especialistas de Mesa de Ayuda
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribución de carga de trabajo, disponibilidad operativa en tiempo real y asignaciones activas.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Técnicos Activos</span>
            <strong className="text-base font-bold text-slate-900">{agents.length}</strong>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tickets en Cola</span>
            <strong className="text-base font-bold text-indigo-600">
              {tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length}
            </strong>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const agentTickets = tickets.filter((t) => t.assignee?.id === agent.id);
          const activeCount = agentTickets.filter(
            (t) => t.status === 'open' || t.status === 'in_progress' || t.status === 'waiting_client'
          ).length;
          const resolvedCount = agentTickets.filter(
            (t) => t.status === 'resolved' || t.status === 'closed'
          ).length;

          return (
            <div
              key={agent.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Avatar and status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  </div>
                  {getStatusBadge(agent.status)}
                </div>

                {/* Name & Role */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{agent.name}</h3>
                <p className="text-xs text-indigo-600 font-medium mb-1">{agent.role}</p>
                <p className="text-[11px] text-slate-500 mb-4">{agent.department}</p>

                {/* Contact */}
                <div className="space-y-1 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-[11px]">{agent.email}</span>
                  </div>
                </div>

                {/* Workload Stats */}
                <div className="grid grid-cols-2 gap-2 text-center mb-4">
                  <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100">
                    <div className="text-lg font-bold text-indigo-700 font-sans">{activeCount}</div>
                    <div className="text-[10px] text-indigo-600 font-semibold uppercase">Activos</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <div className="text-lg font-bold text-emerald-700 font-sans">{resolvedCount}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold uppercase">Resueltos</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleViewAgentTickets(agent.id)}
                className="w-full py-2 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ver tickets asignados</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
