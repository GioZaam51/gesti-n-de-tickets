import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Users,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export const AnalyticsView: React.FC = () => {
  const { tickets, stats } = useTickets();

  // Category counts
  const categoryCounts = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Department counts
  const departmentCounts = tickets.reduce((acc, t) => {
    acc[t.department] = (acc[t.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority counts
  const priorityCounts = tickets.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalTimeMinutes = tickets.reduce((acc, t) => acc + (t.timeSpentMinutes || 0), 0);
  const totalHours = (totalTimeMinutes / 60).toFixed(1);

  const categoryLabels: Record<string, string> = {
    network: 'Redes & Conectividad',
    software: 'Software & Apps',
    hardware: 'Hardware & Equipos',
    access: 'Cuentas & Accesos',
    billing: 'Facturación & Pagos',
    incident: 'Seguridad & SIEM',
    general: 'Consultas Generales',
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Banner / Executive Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Panel de Rendimiento Operativo
            </span>
            <h2 className="text-xl font-bold mt-1 tracking-tight">
              Métricas de Mesa de Ayuda & Cumplimiento de SLA
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Monitoreo continuo de tiempos de resolución, carga de trabajo por departamento e índice de satisfacción del usuario.
            </p>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-700/80 pt-4 md:pt-0 md:pl-6">
            <div>
              <div className="text-2xl font-bold text-emerald-400 font-sans">
                {stats.slaComplianceRate}%
              </div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">Cumplimiento SLA</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400 font-sans">
                {totalHours}h
              </div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">Horas Técnicas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400 font-sans">
                94.8%
              </div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">Satisfacción (CSAT)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tiempo 1ª Respuesta</span>
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">24 min</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            18% más rápido que el objetivo
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tiempo Medio Resolución (MTTR)</span>
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">3.8 horas</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Dentro de ventana de tolerancia
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolución en Primer Contacto (FCR)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">76.4%</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Resueltos en el primer intercambio
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tasa de Cierre Efectivo</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {Math.round(((stats.resolved + stats.closed) / (stats.total || 1)) * 100)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.resolved + stats.closed} de {stats.total} tickets gestionados
          </p>
        </div>
      </div>

      {/* Grid: Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution by Department */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Volumen por Departamento</span>
            <span className="text-[11px] font-normal text-slate-400">Total: {tickets.length}</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(departmentCounts).map(([dept, count]) => {
              const pct = Math.round((count / tickets.length) * 100);
              return (
                <div key={dept}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{dept}</span>
                    <span className="text-slate-500">
                      {count} tickets ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution by Priority */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Distribución por Nivel de Severidad / Prioridad
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center">
              <div className="text-rose-700 font-bold text-xl">{priorityCounts['urgent'] || 0}</div>
              <div className="text-[11px] text-rose-600 font-medium">Urgentes</div>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-center">
              <div className="text-orange-700 font-bold text-xl">{priorityCounts['high'] || 0}</div>
              <div className="text-[11px] text-orange-600 font-medium">Altas</div>
            </div>
            <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-center">
              <div className="text-sky-700 font-bold text-xl">{priorityCounts['medium'] || 0}</div>
              <div className="text-[11px] text-sky-600 font-medium">Medias</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-center">
              <div className="text-slate-700 font-bold text-xl">{priorityCounts['low'] || 0}</div>
              <div className="text-[11px] text-slate-600 font-medium">Bajas</div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 leading-relaxed border border-slate-200">
            <strong>Política de SLA:</strong> Las incidencias catalogadas como <em>Urgente</em> tienen un compromiso de primera respuesta en 1 hora y resolución en 4 horas. Las incidencias <em>Alta</em> tienen ventana máxima de 8 horas.
          </div>
        </div>

        {/* Categories breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Incidencias por Categoría Tecnológica
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(categoryCounts).map(([catKey, count]) => {
              const label = categoryLabels[catKey] || catKey;
              return (
                <div
                  key={catKey}
                  className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {label}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {Math.round((count / tickets.length) * 100)}% de incidencias
                    </span>
                  </div>
                  <span className="text-lg font-bold text-indigo-700 font-mono">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
