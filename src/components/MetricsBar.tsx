import React from 'react';
import {
  Inbox,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export const MetricsBar: React.FC = () => {
  const { stats, filters, setFilters, setViewMode } = useTickets();

  const handleQuickFilter = (status: any) => {
    setViewMode('list');
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? 'all' : status,
    }));
  };

  const handleUrgentFilter = () => {
    setViewMode('list');
    setFilters((prev) => ({
      ...prev,
      priority: prev.priority === 'urgent' ? 'all' : 'urgent',
    }));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Tickets */}
      <div
        onClick={() => {
          setViewMode('list');
          setFilters((prev) => ({ ...prev, status: 'all', priority: 'all' }));
        }}
        className="bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-xs cursor-pointer transition-all hover:-translate-y-0.5 group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">Total Tickets</span>
          <Inbox className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
            {stats.total}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">General</span>
        </div>
      </div>

      {/* Abiertos */}
      <div
        onClick={() => handleQuickFilter('open')}
        className={`bg-white p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all hover:-translate-y-0.5 group ${
          filters.status === 'open' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200/80 hover:border-blue-300'
        }`}
      >
        <div className="flex items-center justify-between text-blue-600 mb-1">
          <span className="text-xs font-medium">Abiertos</span>
          <Clock className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-blue-700 tracking-tight font-sans">
            {stats.open}
          </span>
          <span className="text-[11px] text-blue-600/80 font-medium">Nuevos</span>
        </div>
      </div>

      {/* En Progreso */}
      <div
        onClick={() => handleQuickFilter('in_progress')}
        className={`bg-white p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all hover:-translate-y-0.5 group ${
          filters.status === 'in_progress' ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200/80 hover:border-indigo-300'
        }`}
      >
        <div className="flex items-center justify-between text-indigo-600 mb-1">
          <span className="text-xs font-medium">En Progreso</span>
          <Clock className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-indigo-700 tracking-tight font-sans">
            {stats.inProgress}
          </span>
          <span className="text-[11px] text-indigo-600/80 font-medium">En curso</span>
        </div>
      </div>

      {/* En Espera de Cliente */}
      <div
        onClick={() => handleQuickFilter('waiting_client')}
        className={`bg-white p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all hover:-translate-y-0.5 group ${
          filters.status === 'waiting_client' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-slate-200/80 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between text-amber-600 mb-1">
          <span className="text-xs font-medium">En Espera</span>
          <UserCheck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-700 tracking-tight font-sans">
            {stats.waitingClient}
          </span>
          <span className="text-[11px] text-amber-600/80 font-medium">Del cliente</span>
        </div>
      </div>

      {/* Resueltos / Cerrados */}
      <div
        onClick={() => handleQuickFilter('resolved')}
        className={`bg-white p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all hover:-translate-y-0.5 group ${
          filters.status === 'resolved' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200/80 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between text-emerald-600 mb-1">
          <span className="text-xs font-medium">Resueltos</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-700 tracking-tight font-sans">
            {stats.resolved + stats.closed}
          </span>
          <span className="text-[11px] text-emerald-600/80 font-medium">Finalizados</span>
        </div>
      </div>

      {/* SLA Cumplimiento & Urgentes */}
      <div
        onClick={handleUrgentFilter}
        className={`bg-white p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all hover:-translate-y-0.5 group ${
          filters.priority === 'urgent' ? 'ring-2 ring-rose-500 border-rose-500' : 'border-slate-200/80 hover:border-rose-300'
        }`}
      >
        <div className="flex items-center justify-between text-rose-600 mb-1">
          <span className="text-xs font-medium">SLA & Urgencias</span>
          <Flame className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
              {stats.slaComplianceRate}%
            </span>
            <span className="text-[10px] text-slate-500">SLA</span>
          </div>
          {stats.urgent > 0 && (
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
              {stats.urgent} críticos
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
