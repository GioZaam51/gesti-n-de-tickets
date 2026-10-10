import React from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  ArrowUpDown,
  Clock,
  User,
  ShieldAlert,
  Trash2,
  CheckCircle,
  UserCheck,
  RotateCcw,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { Ticket, TicketStatus, TicketPriority } from '../types/ticket';

export const TicketList: React.FC = () => {
  const {
    filteredTickets,
    filters,
    setFilters,
    resetFilters,
    selectedTicketIds,
    toggleSelectTicket,
    selectAllTickets,
    bulkUpdateStatus,
    bulkAssign,
    bulkDelete,
    setSelectedTicket,
    agents,
  } = useTickets();

  const allSelected =
    filteredTickets.length > 0 && selectedTicketIds.length === filteredTickets.length;

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Abierto</span>;
      case 'in_progress':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">En Progreso</span>;
      case 'waiting_client':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Esperando Cliente</span>;
      case 'resolved':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Resuelto</span>;
      case 'closed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Cerrado</span>;
    }
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            Urgente
          </span>
        );
      case 'high':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">Alta</span>;
      case 'medium':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">Media</span>;
      case 'low':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Baja</span>;
    }
  };

  const getSlaIndicator = (slaDueAt: string, status: TicketStatus) => {
    if (status === 'resolved' || status === 'closed') {
      return <span className="text-emerald-600 font-medium text-xs">Cumplido</span>;
    }
    const diffMs = new Date(slaDueAt).getTime() - Date.now();
    if (diffMs <= 0) {
      return (
        <span className="text-rose-600 font-bold text-xs flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          Vencido
        </span>
      );
    }
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHours < 2) {
      return (
        <span className="text-amber-600 font-medium text-xs flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-500" />
          {diffHours}h {diffMins}m
        </span>
      );
    }
    return (
      <span className="text-slate-500 text-xs flex items-center gap-1">
        <Clock className="w-3 h-3 text-slate-400" />
        {diffHours}h
      </span>
    );
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, título, cliente o tag..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Estado: Todos</option>
              <option value="open">Abierto</option>
              <option value="in_progress">En Progreso</option>
              <option value="waiting_client">Esperando Cliente</option>
              <option value="resolved">Resuelto</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filters.priority}
              onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value as any }))}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Prioridad: Todas</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={filters.department}
              onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value as any }))}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Depto: Todos</option>
              <option value="Soporte TI">Soporte TI</option>
              <option value="Infraestructura">Infraestructura</option>
              <option value="Ciberseguridad">Ciberseguridad</option>
              <option value="Facturación">Facturación</option>
              <option value="Operaciones">Operaciones</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="priority">Mayor prioridad</option>
              <option value="sla">SLA más urgente</option>
            </select>
          </div>
        </div>

        {/* Filter tags & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Mostrando <strong className="text-slate-800">{filteredTickets.length}</strong> de tickets
            </span>
            {(filters.search ||
              filters.status !== 'all' ||
              filters.priority !== 'all' ||
              filters.department !== 'all' ||
              filters.assigneeId !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when tickets are selected) */}
      {selectedTicketIds.length > 0 && (
        <div className="bg-indigo-900 text-white p-3 rounded-xl shadow-md flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-150">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-700 rounded-md">
              {selectedTicketIds.length} seleccionados
            </span>
            <span className="text-xs text-indigo-200 hidden sm:inline">
              Acciones en bloque disponibles:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk status */}
            <select
              onChange={(e) => {
                if (e.target.value) bulkUpdateStatus(e.target.value as TicketStatus);
              }}
              defaultValue=""
              className="bg-indigo-800 border border-indigo-700 text-white text-xs rounded-md px-2.5 py-1 focus:outline-none"
            >
              <option value="" disabled>
                Cambiar estado...
              </option>
              <option value="open">Abierto</option>
              <option value="in_progress">En Progreso</option>
              <option value="waiting_client">Esperando Cliente</option>
              <option value="resolved">Resuelto</option>
              <option value="closed">Cerrado</option>
            </select>

            {/* Bulk assign */}
            <select
              onChange={(e) => {
                if (e.target.value) bulkAssign(e.target.value);
              }}
              defaultValue=""
              className="bg-indigo-800 border border-indigo-700 text-white text-xs rounded-md px-2.5 py-1 focus:outline-none"
            >
              <option value="" disabled>
                Asignar agente...
              </option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
                </option>
              ))}
            </select>

            {/* Bulk delete */}
            <button
              onClick={bulkDelete}
              className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => selectAllTickets(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-28">ID</th>
                <th className="py-3 px-3">Asunto & Solicitante</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3">Prioridad</th>
                <th className="py-3 px-3">Departamento</th>
                <th className="py-3 px-3">Asignado</th>
                <th className="py-3 px-3">Límite SLA</th>
                <th className="py-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No se encontraron tickets con los filtros aplicados</p>
                    <button
                      onClick={resetFilters}
                      className="mt-2 text-indigo-600 hover:text-indigo-800 text-xs font-semibold hover:underline"
                    >
                      Restablecer filtros
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const isSelected = selectedTicketIds.includes(ticket.id);

                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="p-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectTicket(ticket.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Ticket ID */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                        {ticket.id}
                      </td>

                      {/* Title & Requester */}
                      <td className="py-3 px-3 max-w-xs sm:max-w-md">
                        <div className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-950">
                          {ticket.title}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-slate-700">{ticket.requester.name}</span>
                          <span>·</span>
                          <span className="text-slate-400">{ticket.requester.company}</span>
                          {ticket.tags.length > 0 && (
                            <>
                              <span>·</span>
                              <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded text-[10px]">
                                #{ticket.tags[0]}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getPriorityBadge(ticket.priority)}
                      </td>

                      {/* Department */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium">
                        {ticket.department}
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {ticket.assignee ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={ticket.assignee.avatar}
                              alt={ticket.assignee.name}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <span className="text-slate-800 font-medium truncate max-w-[120px]">
                              {ticket.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sin asignar</span>
                        )}
                      </td>

                      {/* SLA */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getSlaIndicator(ticket.slaDueAt, ticket.status)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                          }}
                          className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md font-semibold transition-colors"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
