import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // In-memory demo data for backend API demonstration
  let tickets = [
    {
      id: 'TCK-1048',
      title: 'Error de conexión VPN en oficina remota de Valencia',
      status: 'open',
      priority: 'urgent',
      category: 'network',
      department: 'Infraestructura',
      requester: { name: 'Laura Sánchez', email: 'laura.sanchez@innovatech.com' },
      createdAt: new Date().toISOString(),
      slaHours: 4,
    },
    {
      id: 'TCK-1045',
      title: 'Solicitud de aprovisionamiento de permisos SSO y Google Workspace',
      status: 'in_progress',
      priority: 'medium',
      category: 'access',
      department: 'Soporte TI',
      requester: { name: 'Fernando Ruiz', email: 'fernando.ruiz@innovatech.com' },
      createdAt: new Date().toISOString(),
      slaHours: 24,
    },
    {
      id: 'TCK-1042',
      title: 'Pantalla azul recurrente (BSOD) en portátil Lenovo',
      status: 'in_progress',
      priority: 'urgent',
      category: 'hardware',
      department: 'Soporte TI',
      requester: { name: 'Guillermo Alarcón', email: 'guillermo.alarcon@innovatech.com' },
      createdAt: new Date().toISOString(),
      slaHours: 4,
    },
  ];

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'TicketDesk API',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/tickets', (req, res) => {
    res.json({ success: true, count: tickets.length, data: tickets });
  });

  app.post('/api/tickets', (req, res) => {
    const { title, description, category, priority, department, requester } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'El título es obligatorio' });
    }
    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      description: description || '',
      status: 'open',
      priority: priority || 'medium',
      category: category || 'general',
      department: department || 'Soporte TI',
      requester: requester || { name: 'Usuario Web', email: 'usuario@empresa.com' },
      createdAt: new Date().toISOString(),
      slaHours: priority === 'urgent' ? 4 : 24,
    };
    tickets.unshift(newTicket);
    res.status(201).json({ success: true, data: newTicket });
  });

  app.get('/api/stats', (req, res) => {
    res.json({
      success: true,
      stats: {
        total: tickets.length,
        open: tickets.filter((t) => t.status === 'open').length,
        inProgress: tickets.filter((t) => t.status === 'in_progress').length,
        urgent: tickets.filter((t) => t.priority === 'urgent').length,
      },
    });
  });

  // AI Extraction Endpoint for PDF & PowerPoint documents
  app.post('/api/ai/extract-document', async (req, res) => {
    const { fileName, fileType, fileBase64, textContent } = req.body;

    if (!fileName) {
      return res.status(400).json({ success: false, error: 'Nombre de archivo requerido' });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        // Fallback inteligente si no hay API key configurada
        const isNetwork = fileName.toLowerCase().includes('red') || fileName.toLowerCase().includes('vpn') || fileName.toLowerCase().includes('ipsec');
        const isHardware = fileName.toLowerCase().includes('hard') || fileName.toLowerCase().includes('portatil') || fileName.toLowerCase().includes('bateria');
        const isBilling = fileName.toLowerCase().includes('factur') || fileName.toLowerCase().includes('presupuesto') || fileName.toLowerCase().includes('licenc');

        const simulatedResult = {
          title: isNetwork
            ? `Fallo de Túnel IPSec y Certificado Expirado (${fileName})`
            : isHardware
            ? `Reemplazo y Diagnóstico de Equipos Hardware (${fileName})`
            : isBilling
            ? `Discrepancia en Facturación y Renovación de Nube (${fileName})`
            : `Incidencia Extraída de Documento: ${fileName.replace(/\.[^/.]+$/, '')}`,
          summary: `Se procesó el documento ${fileName} (${fileType.toUpperCase()}). Se identificaron componentes críticos que requieren intervención técnica inmediata de mesa de ayuda, incluyendo sistemas afectados y tareas de mitigación.`,
          category: isNetwork ? 'network' : isHardware ? 'hardware' : isBilling ? 'billing' : 'software',
          priority: isNetwork ? 'urgent' : isHardware ? 'high' : 'medium',
          priorityReason: isNetwork
            ? 'Afecta la conectividad de sedes remotas e interrumpe el acceso a bases de datos corporativas.'
            : 'Impacto operacional en usuarios clave con riesgo de degradación de servicio.',
          department: isNetwork ? 'Infraestructura' : isHardware ? 'Soporte TI' : isBilling ? 'Facturación' : 'Operaciones',
          slaSuggestedHours: isNetwork ? 4 : isHardware ? 8 : 24,
          requesterName: 'Auditoría TI & Documentación',
          requesterEmail: 'auditoria.documentos@innovatech.com',
          affectedSystems: isNetwork
            ? ['Concentrador VPN Fortinet', 'Ruta estática Fase 2', 'Subred 192.168.10.0/24']
            : ['Estaciones de trabajo Lenovo / Dell', 'Controlador gráfico de pantalla', 'Baterías de respaldo'],
          errorCodes: isNetwork
            ? ['IKEv2_AUTH_TIMEOUT', 'CERT_EXPIRED_PEER', 'HTTP_504_GATEWAY']
            : ['CRITICAL_PROCESS_DIED', 'BATTERY_HEALTH_BELOW_40%'],
          actionItems: [
            'Verificar vigencia del certificado perimetral y renovar par de claves.',
            'Aplicar regla de firewall enrutada y reiniciar servicio demonio.',
            'Notificar a los líderes de departamento y registrar prueba de conectividad.',
          ],
          rawKeyFindings: [
            `Documento analizado: ${fileName}`,
            `Formato: ${fileType.toUpperCase()}`,
            'Detección de puntos de falla y plazos comprometidos en SLA.',
          ],
        };

        return res.json({
          success: true,
          provider: 'simulated_fallback',
          data: simulatedResult,
        });
      }

      // Preparar contenido para Gemini 3.8 Flash
      const systemInstruction = `Eres un experto ingeniero de soporte técnico, Helpdesk Nivel 3 y auditor de sistemas.
Tu tarea es analizar el documento adjunto (PDF o presentación de PowerPoint) y extraer toda la información técnica necesaria para crear un ticket de soporte estructurado y completo en el sistema Helpdesk.

Debes responder ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
{
  "title": "Asunto claro y conciso del ticket (máx 90 caracteres)",
  "summary": "Resumen ejecutivo del problema, incidente o requerimiento (2-4 oraciones)",
  "category": "Uno de: hardware, software, network, access, billing, incident, general",
  "priority": "Uno de: urgent, high, medium, low",
  "priorityReason": "Explicación breve de por qué se asignó esta prioridad",
  "department": "Uno de: Soporte TI, Infraestructura, Ciberseguridad, Facturación, Operaciones, Atención al Cliente",
  "slaSuggestedHours": 4, // número de horas (4, 8, 24, o 48)
  "requesterName": "Nombre de la persona o departamento solicitante identificado en el documento",
  "requesterEmail": "Email corporativo sugerido o detectado",
  "affectedSystems": ["sistema1", "sistema2"],
  "errorCodes": ["código o mensaje de error detectado"],
  "actionItems": ["Paso técnico 1 a ejecutar", "Paso técnico 2", "Paso técnico 3"],
  "rawKeyFindings": ["Hallazgo relevante 1", "Hallazgo relevante 2", "Hallazgo relevante 3"]
}`;

      let contents: any;

      if (fileType === 'pdf' && fileBase64) {
        // Enviar PDF como inlineData
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: fileBase64.replace(/^data:application\/pdf;base64,/, ''),
              },
            },
            {
              text: `Analiza este documento PDF (${fileName}) y extrae los datos del ticket de soporte e incidencia según las instrucciones.`,
            },
          ],
        };
      } else {
        // Enviar contenido de texto o presentación PowerPoint
        contents = `Documento: ${fileName} (${fileType.toUpperCase()})\nContenido extraído del archivo:\n\n${textContent || 'Sin contenido de texto directo disponible'}\n\nPor favor analiza la información anterior y extrae todos los datos técnicos para el ticket de soporte.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      let parsedJson: any;
      try {
        parsedJson = JSON.parse(responseText);
      } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        parsedJson = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      }

      return res.json({
        success: true,
        provider: 'gemini-3.8-flash',
        data: parsedJson,
      });
    } catch (err: any) {
      console.error('[AI Extract Error]:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Error procesando documento con IA',
      });
    }
  });

  // Frontend integration: Vite middleware in development or Static files in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TicketDesk Server] escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[TicketDesk Server Error]:', err);
  process.exit(1);
});
