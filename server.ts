import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

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
