import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  LayoutGrid,
  ListFilter,
  BarChart3,
  BookOpen,
  Users,
  UserCheck,
  Download,
  RotateCcw,
  Search,
  ChevronDown,
  Layers,
  ShieldAlert,
  Code2,
  Sparkles,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { USER_PERSONAS } from '../data/mockData';
import { ViewMode } from '../types/ticket';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    setIsCreateModalOpen,
    currentPersona,
    setCurrentPersona,
    stats,
    resetToMockData,
    exportTicketsCSV,
    exportTicketsJSON,
    filters,
    setFilters,
  } = useTickets();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      id: 'kanban',
      label: 'Tablero Kanban',
      icon: <LayoutGrid className="w-4 h-4" />,
      badge: stats.open + stats.inProgress,
    },
    {
      id: 'list',
      label: 'Lista de Tickets',
      icon: <ListFilter className="w-4 h-4" />,
      badge: stats.total,
    },
    {
      id: 'ai_extractor',
      label: 'Extractor IA (PDF/PPT)',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      badge: 'IA Gemini',
    },
    {
      id: 'analytics',
      label: 'Métricas & SLA',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: stats.slaBreachedCount > 0 ? stats.slaBreachedCount : undefined,
    },
    {
      id: 'php',
      label: 'Código PHP & MySQL',
      icon: <Code2 className="w-4 h-4 text-emerald-400" />,
      badge: 'PHP 8',
    },
    {
      id: 'knowledge',
      label: 'Base de Conocimiento',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'team',
      label: 'Equipo de Soporte',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'portal',
      label: 'Portal del Usuario',
      icon: <UserCheck className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      {/* Top tier: Brand, Global Search, Persona & Action buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-sans">
                  TicketDesk
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Helpdesk
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gestión de Incidencias & Servicios TI
              </p>
            </div>
          </div>

          {/* Quick Search in header */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por ID, asunto, solicitante o etiqueta..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Urgent Alert indicator if any */}
            {stats.urgent > 0 && (
              <div
                title={`${stats.urgent} tickets urgentes activos`}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium cursor-pointer"
                onClick={() => {
                  setViewMode('list');
                  setFilters((prev) => ({ ...prev, priority: 'urgent', status: 'all' }));
                }}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>{stats.urgent} urgentes</span>
              </div>
            )}

            {/* Data options dropdown (Export / Reset) */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors"
                title="Opciones de datos"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs"
                  onClick={() => setShowExportMenu(false)}
                >
                  <button
                    onClick={exportTicketsCSV}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Descargar CSV (Excel)</span>
                  </button>
                  <button
                    onClick={exportTicketsJSON}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Descargar JSON</span>
                  </button>
                  <div className="border-t border-slate-700 my-1"></div>
                  <button
                    onClick={resetToMockData}
                    className="w-full text-left px-3 py-2 text-amber-300 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar datos demo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors text-xs text-slate-200"
                title="Cambiar rol de usuario"
              >
                <img
                  src={currentPersona.avatar}
                  alt={currentPersona.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-400/50"
                />
                <div className="text-left hidden sm:block">
                  <div className="font-medium text-white leading-tight">{currentPersona.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{currentPersona.role === 'customer' ? 'Solicitante' : currentPersona.role === 'admin' ? 'Administrador' : 'Agente N2'}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showPersonaMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs"
                  onClick={() => setShowPersonaMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                    Cambiar Persona / Rol
                  </div>
                  {USER_PERSONAS.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => setCurrentPersona(persona)}
                      className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-slate-700 transition-colors ${
                        currentPersona.id === persona.id ? 'bg-indigo-950/60 text-indigo-300' : 'text-slate-200'
                      }`}
                    >
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{persona.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{persona.title}</div>
                      </div>
                      {currentPersona.id === persona.id && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* New Ticket Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Ticket</span>
            </button>
          </div>
        </div>

        {/* Lower tier: View Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          {navItems.map((item) => {
            const isActive = viewMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-indigo-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      item.id === 'analytics'
                        ? 'bg-rose-500/20 text-rose-300'
                        : isActive
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
