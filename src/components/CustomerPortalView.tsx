import React from 'react';
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileQuestion,
  ChevronRight,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export const CustomerPortalView: React.FC = () => {
  const {
    tickets,
    currentPersona,
    setIsCreateModalOpen,
    setSelectedTicket,
    knowledgeArticles,
    setViewMode,
  } = useTickets();

  // Filter tickets belonging to this customer/company
  const myTickets = tickets.filter(
    (t) =>
      t.requester.email.toLowerCase() === currentPersona.email.toLowerCase() ||
      t.requester.name.toLowerCase() === currentPersona.name.toLowerCase() ||
      t.requester.company?.toLowerCase() === 'innovatech hub'
  );

  const activeTickets = myTickets.filter(
    (t) => t.status === 'open' || t.status === 'in_progress' || t.status === 'waiting_client'
  );

  const resolvedTickets = myTickets.filter(
    (t) => t.status === 'resolved' || t.status === 'closed'
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Customer Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Portal de Autoservicio & Soporte
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              Hola, {currentPersona.name} 👋
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Consulta en tiempo real el avance de tus solicitudes de soporte técnico, responde a los técnicos o crea una nueva petición de asistencia para tu equipo.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-all cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Crear Nueva Solicitud</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Tickets on left, Quick Help on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active & Past Tickets (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Tickets Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Mis Solicitudes Activas</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                  {activeTickets.length}
                </span>
              </h3>
            </div>

            {activeTickets.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                <p>No tienes incidencias abiertas en este momento.</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-2 text-indigo-600 font-semibold hover:underline"
                >
                  ¿Necesitas reportar un problema? Haz clic aquí
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-slate-600 group-hover:text-indigo-600">
                        {t.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          t.status === 'open'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : t.status === 'in_progress'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {t.status === 'open'
                          ? 'En Cola de Espera'
                          : t.status === 'in_progress'
                          ? 'En Atención Técnica'
                          : 'Esperando tu Respuesta'}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-950 mb-1">
                      {t.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {t.description}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Técnico asignado: <strong>{t.assignee ? t.assignee.name : 'Asignación pendiente'}</strong>
                      </span>
                      <div className="flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                        <span>Ver conversación</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolved Tickets Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Historial de Solicitudes Resueltas ({resolvedTickets.length})</span>
            </h3>

            {resolvedTickets.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Aún no hay tickets cerrados.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {resolvedTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-500">{t.id}</span>
                        <span className="text-xs font-medium text-slate-800 line-clamp-1">{t.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Resuelto el {new Date(t.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-50 rounded">
                      Resuelto
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Knowledge Base suggestions & FAQ */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-600" />
              <span>Preguntas Frecuentes</span>
            </h3>

            <div className="space-y-3">
              {knowledgeArticles.slice(0, 3).map((art) => (
                <div
                  key={art.id}
                  onClick={() => setViewMode('knowledge')}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 cursor-pointer transition-colors group"
                >
                  <span className="text-[10px] font-bold text-indigo-600 uppercase block mb-1">
                    {art.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {art.summary}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setViewMode('knowledge')}
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors text-center"
            >
              Explorar todo el centro de ayuda
            </button>
          </div>

          {/* Emergency IT Contacts */}
          <div className="p-4 rounded-xl bg-slate-900 text-white shadow-2xs space-y-2 text-xs">
            <span className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider block">
              Soporte Urgente para Eventos Críticos
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Si tu incidencia bloquea a toda una oficina o compromete seguridad, contacta a la línea directa de guardia de TI:
            </p>
            <div className="font-mono text-xs font-bold text-emerald-400 pt-1">
              +34 900 102 300 (Opción 1 - Redes)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
