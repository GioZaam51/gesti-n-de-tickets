import React, { useState } from 'react';
import {
  X,
  Plus,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Check,
  Send,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { TicketCategory, TicketPriority, TicketDepartment } from '../types/ticket';

export const CreateTicketModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createTicket,
    agents,
    currentPersona,
    setSelectedTicket,
  } = useTickets();

  if (!isCreateModalOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('software');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [department, setDepartment] = useState<TicketDepartment>('Soporte TI');
  const [requesterName, setRequesterName] = useState(currentPersona.name);
  const [requesterEmail, setRequesterEmail] = useState(currentPersona.email);
  const [requesterCompany, setRequesterCompany] = useState('InnovaTech Hub');
  const [tagsInput, setTagsInput] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const quickTemplates = [
    {
      title: 'Fallo de acceso a sistema o VPN',
      category: 'network' as TicketCategory,
      priority: 'urgent' as TicketPriority,
      department: 'Infraestructura' as TicketDepartment,
      description: 'Los usuarios no pueden autenticarse a través de la red corporativa. Se recibe error de tiempo de espera agotado al conectar al servidor principal.',
      tags: 'VPN, Red, Acceso',
    },
    {
      title: 'Solicitud de nueva licencia de software',
      category: 'access' as TicketCategory,
      priority: 'medium' as TicketPriority,
      department: 'Soporte TI' as TicketDepartment,
      description: 'Requiero acceso con licencia profesional para la herramienta de diseño/desarrollo para integrarme al nuevo sprint del proyecto.',
      tags: 'Software, Licencia, Permiso',
    },
    {
      title: 'Incidencia de hardware en ordenador portátil',
      category: 'hardware' as TicketCategory,
      priority: 'high' as TicketPriority,
      department: 'Soporte TI' as TicketDepartment,
      description: 'El equipo presenta fallas térmicas y se apaga de forma imprevista durante tareas de alta carga de trabajo.',
      tags: 'Hardware, Laptop, Reparacion',
    },
    {
      title: 'Error en facturación o recibo de servicio',
      category: 'billing' as TicketCategory,
      priority: 'high' as TicketDepartment,
      department: 'Facturación' as TicketDepartment,
      description: 'Se detectó una discrepancia en el importe cobrado con respecto a la cotización anual acordada.',
      tags: 'Factura, Finanzas, Cobro',
    },
  ];

  const handleApplyTemplate = (tpl: any) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setPriority(tpl.priority);
    setDepartment(tpl.department);
    setDescription(tpl.description);
    setTagsInput(tpl.tags);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !requesterName.trim() || !requesterEmail.trim()) {
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newTicket = createTicket({
      title,
      description,
      category,
      priority,
      department,
      requesterName,
      requesterEmail,
      requesterCompany,
      tags: tags.length > 0 ? tags : [category.toUpperCase()],
      assigneeId: assigneeId || undefined,
    });

    setIsCreateModalOpen(false);
    setSelectedTicket(newTicket);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold">Registrar Nuevo Ticket de Soporte</h2>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quick templates chips */}
          <div className="mb-5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Plantillas Rápidas Preconfiguradas:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="text-[11px] px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-md font-medium transition-colors"
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asunto del Ticket <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Caída de VPN en sede Valencia tras reinicio de firewall"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category, Priority, Department row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="software">Software & Apps</option>
                  <option value="hardware">Hardware & Equipos</option>
                  <option value="network">Redes & Conectividad</option>
                  <option value="access">Cuentas & Accesos</option>
                  <option value="billing">Facturación & Pagos</option>
                  <option value="incident">Incidente de Seguridad</option>
                  <option value="general">Consulta General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prioridad
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Baja (SLA 48h)</option>
                  <option value="medium">Media (SLA 24h)</option>
                  <option value="high">Alta (SLA 8h)</option>
                  <option value="urgent">Urgente (SLA 4h)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Departamento
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as TicketDepartment)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Soporte TI">Soporte TI</option>
                  <option value="Infraestructura">Infraestructura</option>
                  <option value="Ciberseguridad">Ciberseguridad</option>
                  <option value="Facturación">Facturación</option>
                  <option value="Operaciones">Operaciones</option>
                  <option value="Atención al Cliente">Atención al Cliente</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción Detallada del Problema <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describa el comportamiento observado, pasos para reproducir el fallo y mensaje de error específico..."
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Requester details */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="block text-xs font-semibold text-slate-700">
                Información del Solicitante
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={requesterEmail}
                    onChange={(e) => setRequesterEmail(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Empresa / Sede</label>
                  <input
                    type="text"
                    value={requesterCompany}
                    onChange={(e) => setRequesterCompany(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Tags & Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Etiquetas (Separadas por coma)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Ej: VPN, Firewall, Redes, VIP"
                  className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asignar a Técnico (Opcional)
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Dejar sin asignar (Cola general)</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Crear Ticket</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
