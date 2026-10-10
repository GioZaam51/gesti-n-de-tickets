import React, { useState } from 'react';
import {
  FileText,
  Presentation,
  Sparkles,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Server,
  Code,
  ListChecks,
  Check,
  Copy,
  Download,
  RotateCcw,
  ShieldAlert,
  Cpu,
  Layers,
} from 'lucide-react';
import JSZip from 'jszip';
import { useTickets } from '../context/TicketContext';
import { TicketCategory, TicketPriority, TicketDepartment } from '../types/ticket';

interface ExtractedTicketData {
  title: string;
  summary: string;
  category: TicketCategory;
  priority: TicketPriority;
  priorityReason: string;
  department: TicketDepartment;
  slaSuggestedHours: number;
  requesterName: string;
  requesterEmail: string;
  affectedSystems: string[];
  errorCodes: string[];
  actionItems: string[];
  rawKeyFindings: string[];
}

export const AiExtractorView: React.FC = () => {
  const { createTicket, setSelectedTicket, setViewMode } = useTickets();

  const [activeFile, setActiveFile] = useState<{
    name: string;
    type: 'pdf' | 'pptx';
    size: string;
    rawText?: string;
    base64?: string;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedTicketData | null>(null);
  const [copied, setCopied] = useState(false);
  const [providerUsed, setProviderUsed] = useState<string>('gemini-3.8-flash');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  // Pre-configured sample documents for instant testing
  const sampleDocuments = [
    {
      name: 'Auditoría_Red_IPSec_Valencia.pdf',
      type: 'pdf' as const,
      size: '1.4 MB',
      description: 'Informe de falla de túnel VPN Fortinet, pérdida de ruta estática Fase 2 e impacto en 12 consultores.',
      previewText: `INFORME DE INCIDENCIA DE RED Y TELECOMUNICACIONES
Sede: Valencia - Parque Tecnológico
Fecha: 2026-10-07 | Severidad: Crítica
Resumen: Tras el reinicio programado del cortafuegos perimetral FortiGate 200F a las 08:30 AM, el túnel VPN IPSec IKEv2 hacia el datacenter central no restableció la negociación de fase 2.
Impacto: 12 ingenieros y consultores no pueden acceder a los servicios de ERP, Jira ni bases de datos PostgreSQL internas.
Códigos de error: IKEv2_AUTH_TIMEOUT, NAT_TRAVERSAL_FAIL_PORT_4500.
Sistemas afectados: Concentrador VPN perimetral, Subred 192.168.10.0/24, Servidor de autenticación RADIUS.
Acciones requeridas: Revisar vigencia de certificado X.509, restablecer ruta estática NAT y verificar regla en interfaz wan1.`,
    },
    {
      name: 'Presentación_Caída_ERP_SAP_Q3.pptx',
      type: 'pptx' as const,
      size: '2.8 MB',
      description: 'Diapositivas de análisis post-mortem por timeouts en balances contables y saturación de base de datos.',
      previewText: `DIAPOSITIVA 1: REVISIÓN DE RENDIMIENTO ERP Y CIERRE MENSUAL
DIAPOSITIVA 2: PROBLEMA OBSERVADO
- Usuarios de Finanzas y Contabilidad reportan congelamiento en la exportación de reportes consolidados.
- Códigos HTTP 504 Gateway Timeout y HTTP 502 Bad Gateway recurrentes en horario 11:00 - 14:00.
DIAPOSITIVA 3: ANÁLISIS DE BASE DE DATOS
- La consulta acumulada realiza un Full Table Scan sobre la tabla accounting_ledger (más de 18 millones de registros).
- Se agotó el pool de conexiones del microservicio de nóminas.
DIAPOSITIVA 4: IMPACTO DE NEGOCIO
- Cierre fiscal mensual retrasado. 5 contadores sin capacidad de emitir balances ante el ministerio de hacienda.
DIAPOSITIVA 5: RECOMENDACIONES TÉCNICAS
- Crear índice compuesto en (tenant_id, fiscal_year, created_at).
- Aumentar timeout en Nginx de 60s a 180s como contingencia inmediata.`,
    },
    {
      name: 'Informe_Ciberseguridad_Ataque_SSH.pdf',
      type: 'pdf' as const,
      size: '890 KB',
      description: 'Reporte de detección SIEM de 4,500 intentos de fuerza bruta sobre puerto bastión en nube AWS.',
      previewText: `ALERTA DE SEGURIDAD N2 - CENTRO DE OPERACIONES DE CIBERSEGURIDAD (SOC)
Incidencia: Spike de intentos fallidos de autenticación SSH.
Origen: Rango IP público no categorizado 198.51.100.44 hacia instancia bastion en AWS eu-west-1.
Total de intentos: 4,520 eventos en una ventana de 15 minutos.
Evaluación: Ninguna clave privada ni credencial fue comprometida.
Acción ejecutada: Bloqueo perimetral en AWS WAF y Security Group.
Requerimiento para TI: Migrar acceso de ingenieros a AWS Systems Manager Session Manager y deshabilitar puerto 22 público.`,
    },
    {
      name: 'Plan_Renovación_Laptops_VIP_2026.pptx',
      type: 'pptx' as const,
      size: '3.1 MB',
      description: 'Presentación de directores con fallos de pantalla azul BSOD en laptops Lenovo ThinkPad y degradación de batería.',
      previewText: `DIAPOSITIVA 1: PLAN DE SOPORTE HARDWARE - EQUIPOS DIRECTIVOS
DIAPOSITIVA 2: SÍNTOMAS REPORTADOS
- 4 portátiles Lenovo ThinkPad X1 Carbon presentan reinicios inesperados BSOD (CRITICAL_PROCESS_DIED).
- Ocurrencia repetida durante videoconferencias de alta resolución.
DIAPOSITIVA 3: ESTADO DE BATERÍAS
- Salud de batería degradada por debajo del 40% en equipos con más de 24 meses de uso.
DIAPOSITIVA 4: PROPUESTA DE RESOLUCIÓN
- Preparar 4 MacBook Pro o Dell XPS de reserva configurados con MDM corporativo.
- Reemplazo inmediato para Dirección General y Dirección Financiera.`,
    },
  ];

  // Helper to extract text from PPTX files using JSZip
  const extractTextFromPptxZip = async (file: File): Promise<string> => {
    try {
      const zip = await JSZip.loadAsync(file);
      const slideFiles = Object.keys(zip.files).filter(
        (filename) => filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml')
      );

      let fullText = `Presentación PowerPoint: ${file.name}\nNúmero de diapositivas detectadas: ${slideFiles.length}\n\n`;

      for (let i = 0; i < slideFiles.length; i++) {
        const slideName = slideFiles[i];
        const content = await zip.files[slideName].async('text');
        // Extract text inside <a:t> tags
        const textMatches = content.match(/<a:t>([^<]+)<\/a:t>/g);
        if (textMatches && textMatches.length > 0) {
          const slideText = textMatches.map((m) => m.replace(/<\/?a:t>/g, '')).join(' ');
          fullText += `[Diapositiva ${i + 1}]: ${slideText}\n`;
        }
      }

      return fullText;
    } catch (e) {
      console.warn('Error extracting PPTX with JSZip, falling back to basic metadata:', e);
      return `Presentación PowerPoint: ${file.name} (Tamaño: ${(file.size / 1024).toFixed(1)} KB)`;
    }
  };

  // Handle user uploaded file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setCreatedTicketId(null);
    const isPdf = file.name.endsWith('.pdf');
    const isPptx = file.name.endsWith('.pptx') || file.name.endsWith('.ppt');

    if (!isPdf && !isPptx) {
      setErrorMsg('Por favor seleccione un archivo PDF (.pdf) o presentación PowerPoint (.pptx, .ppt)');
      return;
    }

    if (isPptx) {
      const extractedText = await extractTextFromPptxZip(file);
      setActiveFile({
        name: file.name,
        type: 'pptx',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        rawText: extractedText,
      });
      runAnalysis(file.name, 'pptx', undefined, extractedText);
    } else {
      // PDF
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setActiveFile({
          name: file.name,
          type: 'pdf',
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          base64,
        });
        runAnalysis(file.name, 'pdf', base64, undefined);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI analysis
  const runAnalysis = async (
    fileName: string,
    fileType: 'pdf' | 'pptx',
    fileBase64?: string,
    textContent?: string
  ) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setExtractedData(null);
    setCreatedTicketId(null);

    try {
      const res = await fetch('/api/ai/extract-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType,
          fileBase64,
          textContent,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        setExtractedData(json.data);
        setProviderUsed(json.provider || 'gemini-3.8-flash');
      } else {
        throw new Error(json.error || 'No se pudo extraer la información del documento');
      }
    } catch (err: any) {
      console.error('Error running AI extraction:', err);
      setErrorMsg(err.message || 'Error al comunicarse con el modelo de IA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: typeof sampleDocuments[0]) => {
    setActiveFile({
      name: sample.name,
      type: sample.type,
      size: sample.size,
      rawText: sample.previewText,
    });
    runAnalysis(sample.name, sample.type, undefined, sample.previewText);
  };

  const handleConvertToTicket = () => {
    if (!extractedData) return;

    const newTicket = createTicket({
      title: extractedData.title,
      description: `${extractedData.summary}\n\n📋 Tareas de Mitigación Recomendadas:\n${extractedData.actionItems.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n🔍 Sistemas Afectados:\n${extractedData.affectedSystems.join(', ')}`,
      category: extractedData.category || 'software',
      priority: extractedData.priority || 'medium',
      department: extractedData.department || 'Soporte TI',
      requesterName: extractedData.requesterName || 'Auditoría Técnica IA',
      requesterEmail: extractedData.requesterEmail || 'ia.extractor@innovatech.com',
      tags: ['IA_EXTRACTED', extractedData.category.toUpperCase()],
    });

    setCreatedTicketId(newTicket.id);
    setSelectedTicket(newTicket);
  };

  const handleCopyAnalysis = () => {
    if (!extractedData) return;
    const text = `TICKET EXTRAÍDO CON IA:\nAsunto: ${extractedData.title}\nPrioridad: ${extractedData.priority.toUpperCase()}\nDepartamento: ${extractedData.department}\nSLA Sugerido: ${extractedData.slaSuggestedHours} horas\n\nResumen:\n${extractedData.summary}\n\nSistemas Afectados: ${extractedData.affectedSystems.join(', ')}\nCódigos de Error: ${extractedData.errorCodes.join(', ')}\n\nAcciones:\n${extractedData.actionItems.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!extractedData) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(extractedData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `extraccion-ia-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Módulo IA Multimodal
              </span>
              <span className="text-xs text-slate-400">· Modelo: Gemini 3.8 Flash</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Extracción Inteligente de Tickets desde PDF & PowerPoint
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Carga informes técnicos, auditorías en PDF o presentaciones en PowerPoint (.pptx) de incidencias. La inteligencia artificial extrae automáticamente la severidad, sistemas afectados, códigos de error y genera el ticket de soporte listo para ser atendido.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700/80 self-start md:self-auto text-xs">
            <div className="p-2 bg-indigo-600/30 rounded-lg text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Motor de Procesamiento</span>
              <strong className="text-white font-mono text-xs">{providerUsed}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Samples (Left) + Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload box & Sample Document Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upload Dropzone */}
          <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors shadow-2xs text-center relative group">
            <input
              type="file"
              accept=".pdf,.pptx,.ppt"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="space-y-3 pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Subir documento PDF o PowerPoint
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Arrastra aquí tu archivo o haz clic para explorar (.pdf, .pptx, .ppt)
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  <FileText className="w-3 h-3 text-rose-500" />
                  PDF (Nativo)
                </span>
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  <Presentation className="w-3 h-3 text-orange-500" />
                  PowerPoint (Slides & XML)
                </span>
              </div>
            </div>
          </div>

          {/* Sample Documents for 1-Click test */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                O prueba con documentos de ejemplo:
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                1 Clic
              </span>
            </div>

            <div className="space-y-2.5">
              {sampleDocuments.map((doc, idx) => {
                const isSelected = activeFile?.name === doc.name;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectSample(doc)}
                    className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-400/30'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        doc.type === 'pdf'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {doc.type === 'pdf' ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <Presentation className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-slate-900 truncate text-xs">{doc.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">{doc.size}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Extraction Results (7 cols) */}
        <div className="lg:col-span-7">
          {isAnalyzing ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-4 min-h-[460px] flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 animate-ping"></div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Procesando documento con {providerUsed}...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Analizando estructura técnica, identificando entidades afectadas, extrayendo errores y formulando propuesta de ticket.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-indigo-600 font-medium bg-indigo-50 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                <span>Extrayendo métricas de severidad y SLA</span>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Error en el procesamiento</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">{errorMsg}</p>
            </div>
          ) : extractedData ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-0 animate-in fade-in">
              {/* Header result bar */}
              <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ Análisis Completado
                    </span>
                    <span className="text-xs text-slate-400">
                      Archivo: {activeFile?.name}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {extractedData.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyAnalysis}
                    title="Copiar texto del análisis"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleExportJson}
                    title="Exportar JSON"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Success alert when converted */}
                {createdTicketId && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                    <span className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ¡Ticket <strong>{createdTicketId}</strong> registrado exitosamente en la plataforma!
                    </span>
                    <button
                      onClick={() => setViewMode('kanban')}
                      className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Ir al Tablero Kanban →
                    </button>
                  </div>
                )}

                {/* Badges row: Priority, Department, SLA */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Prioridad</span>
                    <span
                      className={`font-bold uppercase text-xs ${
                        extractedData.priority === 'urgent'
                          ? 'text-rose-700'
                          : extractedData.priority === 'high'
                          ? 'text-orange-700'
                          : 'text-indigo-700'
                      }`}
                    >
                      {extractedData.priority}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Departamento</span>
                    <span className="font-bold text-slate-800 text-xs truncate block">
                      {extractedData.department}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">SLA Estimado</span>
                    <span className="font-bold text-emerald-700 text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {extractedData.slaSuggestedHours} horas
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Categoría</span>
                    <span className="font-bold text-slate-800 text-xs capitalize truncate block">
                      {extractedData.category}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 text-xs text-slate-700 space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs block">
                    Resumen Técnico del Documento:
                  </span>
                  <p className="leading-relaxed">{extractedData.summary}</p>
                  <p className="text-[11px] text-indigo-700 pt-1 font-medium italic">
                    Motivo de severidad: {extractedData.priorityReason}
                  </p>
                </div>

                {/* Affected Systems & Error Codes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Systems */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-indigo-600" />
                      Sistemas / Equipos Afectados
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedData.affectedSystems?.map((sys, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[11px] font-medium"
                        >
                          {sys}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Error codes */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-rose-600" />
                      Códigos de Error / Alertas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedData.errorCodes?.map((code, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-mono text-[10px] font-bold"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-emerald-600" />
                    Pasos de Acción Inmediatos Recomendados
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {extractedData.actionItems?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Convert to Ticket */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Solicitante asignado: <strong>{extractedData.requesterName}</strong>
                  </div>

                  <button
                    onClick={handleConvertToTicket}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Crear Ticket en Helpdesk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-2xs space-y-3 min-h-[460px] flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Ningún documento seleccionado
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Sube un documento PDF o presentación PowerPoint, o selecciona uno de los ejemplos preconfigurados a la izquierda para iniciar la extracción con IA.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
