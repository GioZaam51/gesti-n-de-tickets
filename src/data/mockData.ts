import { Ticket, SupportAgent, KnowledgeArticle, CannedResponse, UserPersona } from '../types/ticket';

export const SUPPORT_AGENTS: SupportAgent[] = [
  {
    id: 'agt-1',
    name: 'Elena Gómez',
    email: 'elena.gomez@empresa.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Especialista N2 Soporte',
    department: 'Soporte TI',
    status: 'available',
    activeTicketsCount: 4,
  },
  {
    id: 'agt-2',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@empresa.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Lead de Infraestructura & Cloud',
    department: 'Infraestructura',
    status: 'busy',
    activeTicketsCount: 3,
  },
  {
    id: 'agt-3',
    name: 'Valeria Restrepo',
    email: 'valeria.restrepo@empresa.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Analista de Ciberseguridad',
    department: 'Ciberseguridad',
    status: 'available',
    activeTicketsCount: 2,
  },
  {
    id: 'agt-4',
    name: 'Mateo Morales',
    email: 'mateo.morales@empresa.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Especialista en Facturación y Cuentas',
    department: 'Facturación',
    status: 'away',
    activeTicketsCount: 1,
  },
];

export const USER_PERSONAS: UserPersona[] = [
  {
    id: 'persona-agent',
    name: 'Elena Gómez',
    email: 'elena.gomez@empresa.com',
    role: 'agent',
    title: 'Agente de Soporte (Nivel 2)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'persona-admin',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@empresa.com',
    role: 'admin',
    title: 'Administrador de Mesa de Ayuda',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'persona-customer',
    name: 'Laura Sánchez',
    email: 'laura.sanchez@innovatech.com',
    role: 'customer',
    title: 'Solicitante / Cliente (InnovaTech)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TCK-1048',
    title: 'Error de conexión VPN en oficina remota de Valencia',
    description: 'Varios empleados no pueden conectarse al túnel IPSec desde las 08:30 AM tras el reinicio programado del cortafuegos perimetral. Devuelve timeout en handshake IKEv2.',
    status: 'open',
    priority: 'urgent',
    category: 'network',
    department: 'Infraestructura',
    requester: {
      name: 'Laura Sánchez',
      email: 'laura.sanchez@innovatech.com',
      company: 'InnovaTech Hub',
      role: 'Directora de Operaciones',
      phone: '+34 611 234 567',
    },
    assignee: SUPPORT_AGENTS[1], // Carlos Mendoza
    createdAt: '2026-10-07T08:35:00Z',
    updatedAt: '2026-10-07T09:15:00Z',
    slaDueAt: '2026-10-07T12:35:00Z',
    firstResponseDueAt: '2026-10-07T09:35:00Z',
    tags: ['VPN', 'Red', 'Urgente', 'Valencia'],
    timeSpentMinutes: 45,
    messages: [
      {
        id: 'msg-1',
        senderId: 'req-1',
        senderName: 'Laura Sánchez',
        senderRole: 'customer',
        type: 'public_reply',
        content: 'Hola equipo de soporte, ninguno de nuestros 12 consultores en la sede de Valencia puede acceder a las bases de datos internas ni al CRM por fallo en la VPN.',
        timestamp: '2026-10-07T08:35:00Z',
      },
      {
        id: 'msg-2',
        senderId: 'agt-2',
        senderName: 'Carlos Mendoza',
        senderRole: 'agent',
        type: 'internal_note',
        content: 'Revisando los logs del concentrador Fortinet. Parece que la regla NAT de fase 2 perdió la ruta estática tras el firmware update.',
        timestamp: '2026-10-07T09:00:00Z',
      },
      {
        id: 'msg-3',
        senderId: 'agt-2',
        senderName: 'Carlos Mendoza',
        senderRole: 'agent',
        type: 'public_reply',
        content: 'Hola Laura, estamos aplicando un parche de enrutamiento al concentrador principal. Esperamos restaurar el tráfico en aproximadamente 30 minutos.',
        timestamp: '2026-10-07T09:15:00Z',
      },
    ],
    activities: [
      {
        id: 'act-1',
        type: 'created',
        actor: 'Laura Sánchez',
        description: 'Ticket creado vía Portal Web',
        timestamp: '2026-10-07T08:35:00Z',
      },
      {
        id: 'act-2',
        type: 'assigned',
        actor: 'Sistema Automático',
        description: 'Asignado a Carlos Mendoza (Infraestructura)',
        timestamp: '2026-10-07T08:36:00Z',
      },
      {
        id: 'act-3',
        type: 'note_added',
        actor: 'Carlos Mendoza',
        description: 'Nota interna agregada',
        timestamp: '2026-10-07T09:00:00Z',
      },
    ],
  },
  {
    id: 'TCK-1045',
    title: 'Solicitud de aprovisionamiento de permisos SSO y Google Workspace',
    description: 'Nuevo ingreso para el área de Analítica y BI a partir del lunes próximo. Requiere cuenta en Google Workspace, acceso a BigQuery en GCP y licencia de Tableau.',
    status: 'in_progress',
    priority: 'medium',
    category: 'access',
    department: 'Soporte TI',
    requester: {
      name: 'Fernando Ruiz',
      email: 'fernando.ruiz@innovatech.com',
      company: 'InnovaTech Hub',
      role: 'Responsable de RRHH',
    },
    assignee: SUPPORT_AGENTS[0], // Elena Gómez
    createdAt: '2026-10-06T14:20:00Z',
    updatedAt: '2026-10-07T10:00:00Z',
    slaDueAt: '2026-10-08T18:00:00Z',
    firstResponseDueAt: '2026-10-06T16:20:00Z',
    tags: ['Onboarding', 'SSO', 'Google Workspace', 'Permisos'],
    timeSpentMinutes: 30,
    messages: [
      {
        id: 'msg-4',
        senderId: 'req-2',
        senderName: 'Fernando Ruiz',
        senderRole: 'customer',
        type: 'public_reply',
        content: 'Adjunto formulario de contratación para Mariana Torres (Senior Data Analyst). Su fecha de inicio es el próximo lunes.',
        timestamp: '2026-10-06T14:20:00Z',
      },
      {
        id: 'msg-5',
        senderId: 'agt-1',
        senderName: 'Elena Gómez',
        senderRole: 'agent',
        type: 'public_reply',
        content: 'Cuenta de Google Workspace y Okta SSO ya creada con alias mariana.torres@innovatech.com. Estoy a la espera de aprobación del responsable del grupo en BigQuery.',
        timestamp: '2026-10-07T10:00:00Z',
      },
    ],
    activities: [
      {
        id: 'act-4',
        type: 'created',
        actor: 'Fernando Ruiz',
        description: 'Ticket creado con prioridad Media',
        timestamp: '2026-10-06T14:20:00Z',
      },
      {
        id: 'act-5',
        type: 'status_change',
        actor: 'Elena Gómez',
        description: 'Estado cambiado a En Progreso',
        timestamp: '2026-10-07T09:40:00Z',
      },
    ],
  },
  {
    id: 'TCK-1044',
    title: 'Discrepancia en factura mensual #INV-2026-092 y recargo indebido',
    description: 'La factura recibida incluye un cobro por 5 licencias extra de almacenamiento en la nube que fueron dadas de baja el pasado 15 de septiembre.',
    status: 'waiting_client',
    priority: 'high',
    category: 'billing',
    department: 'Facturación',
    requester: {
      name: 'Beatriz Navarro',
      email: 'beatriz.navarro@globalcorp.es',
      company: 'GlobalCorp Logistics',
      role: 'Directora Financiera',
    },
    assignee: SUPPORT_AGENTS[3], // Mateo Morales
    createdAt: '2026-10-05T11:10:00Z',
    updatedAt: '2026-10-06T16:30:00Z',
    slaDueAt: '2026-10-08T12:00:00Z',
    firstResponseDueAt: '2026-10-05T13:10:00Z',
    tags: ['Facturación', 'Ajuste', 'Finanzas'],
    timeSpentMinutes: 60,
    messages: [
      {
        id: 'msg-6',
        senderId: 'req-3',
        senderName: 'Beatriz Navarro',
        senderRole: 'customer',
        type: 'public_reply',
        content: 'Buenos días, notamos un cargo por €250 adicionales por licencias ya desprovisionadas. Por favor emitir nota de crédito rectificativa.',
        timestamp: '2026-10-05T11:10:00Z',
      },
      {
        id: 'msg-7',
        senderId: 'agt-4',
        senderName: 'Mateo Morales',
        senderRole: 'agent',
        type: 'public_reply',
        content: 'Estimada Beatriz, hemos validado la fecha de baja en el ERP. Para procesar el abono a su cuenta corriente necesitamos la confirmación del número de cuenta IBAN receptor.',
        timestamp: '2026-10-06T16:30:00Z',
      },
    ],
    activities: [
      {
        id: 'act-6',
        type: 'created',
        actor: 'Beatriz Navarro',
        description: 'Ticket creado vía Email',
        timestamp: '2026-10-05T11:10:00Z',
      },
      {
        id: 'act-7',
        type: 'status_change',
        actor: 'Mateo Morales',
        description: 'Estado cambiado a Esperando Cliente',
        timestamp: '2026-10-06T16:30:00Z',
      },
    ],
  },
  {
    id: 'TCK-1042',
    title: 'Pantalla azul recurrente (BSOD) en portátil Lenovo ThinkPad de Gerencia',
    description: 'El equipo de la dirección general sufre reinicios espontáneos con código CRITICAL_PROCESS_DIED tras actualización de controladores gráficos de Windows.',
    status: 'in_progress',
    priority: 'urgent',
    category: 'hardware',
    department: 'Soporte TI',
    requester: {
      name: 'Guillermo Alarcón',
      email: 'guillermo.alarcon@innovatech.com',
      company: 'InnovaTech Hub',
      role: 'Director General',
    },
    assignee: SUPPORT_AGENTS[0], // Elena Gómez
    createdAt: '2026-10-06T09:00:00Z',
    updatedAt: '2026-10-07T11:20:00Z',
    slaDueAt: '2026-10-07T17:00:00Z',
    firstResponseDueAt: '2026-10-06T10:00:00Z',
    tags: ['Hardware', 'Windows', 'VIP', 'Lenovo'],
    timeSpentMinutes: 90,
    messages: [
      {
        id: 'msg-8',
        senderId: 'req-4',
        senderName: 'Guillermo Alarcón',
        senderRole: 'customer',
        type: 'public_reply',
        content: 'Llevo 3 reinicios mientras estaba en videollamadas con inversores. Es inaceptable, necesito solución inmediata o equipo de reemplazo.',
        timestamp: '2026-10-06T09:00:00Z',
      },
      {
        id: 'msg-9',
        senderId: 'agt-1',
        senderName: 'Elena Gómez',
        senderRole: 'agent',
        type: 'internal_note',
        content: 'Le preparé un MacBook Pro de sustitución configurado con MDM por si el rollback de driver no estabiliza el Lenovo.',
        timestamp: '2026-10-06T11:00:00Z',
      },
      {
        id: 'msg-10',
        senderId: 'agt-1',
        senderName: 'Elena Gómez',
        senderRole: 'agent',
        type: 'public_reply',
        content: 'Don Guillermo, un técnico acaba de pasar a su despacho para realizar el rollback del driver o entregarle el portátil de reserva listo para trabajar.',
        timestamp: '2026-10-07T11:20:00Z',
      },
    ],
    activities: [
      {
        id: 'act-8',
        type: 'created',
        actor: 'Guillermo Alarcón',
        description: 'Ticket creado con prioridad Urgente',
        timestamp: '2026-10-06T09:00:00Z',
      },
      {
        id: 'act-9',
        type: 'priority_change',
        actor: 'Elena Gómez',
        description: 'Prioridad marcada como Urgente (VIP)',
        timestamp: '2026-10-06T09:15:00Z',
      },
    ],
  },
  {
    id: 'TCK-1039',
    title: 'Alerta de intentos masivos de fuerza bruta en panel SSH de nodo producción',
    description: 'El SIEM detectó más de 4,500 intentos de inicio de sesión fallidos desde un rango de IP no reconocido hacia el puerto bastion en AWS eu-west-1.',
    status: 'resolved',
    priority: 'high',
    category: 'incident',
    department: 'Ciberseguridad',
    requester: {
      name: 'Sistema Automatizado SIEM',
      email: 'alerts-siem@empresa.com',
      company: 'Sistema de Seguridad',
      role: 'Monitor Automático',
    },
    assignee: SUPPORT_AGENTS[2], // Valeria Restrepo
    createdAt: '2026-10-04T22:15:00Z',
    updatedAt: '2026-10-05T08:00:00Z',
    slaDueAt: '2026-10-05T04:15:00Z',
    firstResponseDueAt: '2026-10-04T23:15:00Z',
    tags: ['Seguridad', 'SSH', 'SIEM', 'AWS', 'Firewall'],
    timeSpentMinutes: 75,
    messages: [
      {
        id: 'msg-11',
        senderId: 'siem',
        senderName: 'SIEM Alerter',
        senderRole: 'customer',
        type: 'public_reply',
        content: 'ALERTA N2: Regla de detección "SSH Brute Force Spikes" activada sobre IP pública 198.51.100.44.',
        timestamp: '2026-10-04T22:15:00Z',
      },
      {
        id: 'msg-12',
        senderId: 'agt-3',
        senderName: 'Valeria Restrepo',
        senderRole: 'agent',
        type: 'public_reply',
        content: 'Rango de subred IP bloqueado en AWS WAF y Security Group perimetral. Se verificó que ninguna clave privada fue comprometida.',
        timestamp: '2026-10-05T08:00:00Z',
      },
    ],
    activities: [
      {
        id: 'act-10',
        type: 'created',
        actor: 'SIEM',
        description: 'Ticket generado por webhook automático',
        timestamp: '2026-10-04T22:15:00Z',
      },
      {
        id: 'act-11',
        type: 'status_change',
        actor: 'Valeria Restrepo',
        description: 'Ticket marcado como Resuelto',
        timestamp: '2026-10-05T08:00:00Z',
      },
    ],
  },
  {
    id: 'TCK-1035',
    title: 'Migración de buzones de correo y configuración de registros SPF/DKIM',
    description: 'Finalización de la sincronización de cuentas antiguas hacia el nuevo dominio @innovatech.com y verificación de entregabilidad antispam.',
    status: 'closed',
    priority: 'low',
    category: 'software',
    department: 'Soporte TI',
    requester: {
      name: 'David Ortiz',
      email: 'david.ortiz@innovatech.com',
      company: 'InnovaTech Hub',
      role: 'Responsable de Marketing',
    },
    assignee: SUPPORT_AGENTS[0], // Elena Gómez
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-04T15:00:00Z',
    slaDueAt: '2026-10-06T10:00:00Z',
    firstResponseDueAt: '2026-10-02T14:00:00Z',
    tags: ['Email', 'DNS', 'Google', 'SPF'],
    timeSpentMinutes: 120,
    messages: [
      {
        id: 'msg-13',
        senderId: 'req-5',
        senderName: 'David Ortiz',
        senderRole: 'customer',
        type: 'public_reply',
        content: 'Confirmamos que las pruebas de envío de newsletters ya no caen en carpeta de correo no deseado. ¡Muchas gracias por el soporte!',
        timestamp: '2026-10-04T14:50:00Z',
      },
      {
        id: 'msg-14',
        senderId: 'agt-1',
        senderName: 'Elena Gómez',
        senderRole: 'agent',
        type: 'public_reply',
        content: 'Perfecto David, los registros DMARC y DKIM quedaron propagados al 100%. Procedo a cerrar la incidencia.',
        timestamp: '2026-10-04T15:00:00Z',
      },
    ],
    activities: [
      {
        id: 'act-12',
        type: 'status_change',
        actor: 'Elena Gómez',
        description: 'Ticket cerrado con calificación 5/5',
        timestamp: '2026-10-04T15:00:00Z',
      },
    ],
  },
  {
    id: 'TCK-1049',
    title: 'Lentitud y timeouts en generación de reportes mensuales en ERP',
    description: 'Los usuarios del departamento de contabilidad reportan que la descarga del balance acumulado se queda congelada tras 60 segundos y lanza error HTTP 504 Gateway Timeout.',
    status: 'open',
    priority: 'high',
    category: 'software',
    department: 'Operaciones',
    requester: {
      name: 'Silvia Marín',
      email: 'silvia.marin@innovatech.com',
      company: 'InnovaTech Hub',
      role: 'Contadora General',
    },
    assignee: undefined, // Sin asignar aún
    createdAt: '2026-10-07T11:45:00Z',
    updatedAt: '2026-10-07T11:45:00Z',
    slaDueAt: '2026-10-07T15:45:00Z',
    firstResponseDueAt: '2026-10-07T12:45:00Z',
    tags: ['ERP', 'Timeout', 'Base de Datos', 'Urgente'],
    timeSpentMinutes: 0,
    messages: [
      {
        id: 'msg-15',
        senderId: 'req-6',
        senderName: 'Silvia Marín',
        senderRole: 'customer',
        type: 'public_reply',
        content: 'Tenemos el cierre contable hoy antes de las 18:00 y ninguno de los 5 contables puede exportar el informe consolidado. Por favor su apoyo urgente.',
        timestamp: '2026-10-07T11:45:00Z',
      },
    ],
    activities: [
      {
        id: 'act-13',
        type: 'created',
        actor: 'Silvia Marín',
        description: 'Ticket creado sin asignar',
        timestamp: '2026-10-07T11:45:00Z',
      },
    ],
  },
];

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'kb-1',
    title: 'Guía rápida de conexión a la VPN corporativa (Windows y macOS)',
    category: 'Redes y Conectividad',
    summary: 'Pasos para instalar el cliente OpenVPN / FortiClient, importar credenciales y solucionar errores de handshake IKEv2.',
    content: `### 1. Requisitos Previos
- Cuenta corporativa activa con doble factor de autenticación (2FA / Google Authenticator).
- Cliente VPN oficial instalado (versión 7.2 o superior).

### 2. Configuración en Windows
1. Descargue el instalador desde el portal interno: \`https://vpn.empresa.com\`.
2. Al ejecutar, seleccione "Importar perfil" y cargue el archivo \`empresa-secure.ovpn\`.
3. Ingrese su correo corporativo y la contraseña de red.
4. Cuando solicite el código TOTP, ingrese el código de 6 dígitos de su aplicación móvil.

### 3. Solución de Problemas Frecuentes
- **Error "Timeout en Handshake"**: Verifique que su router doméstico no tenga bloqueado el tráfico UDP en el puerto 1194 o 4500.
- **Error de certificado**: Ejecute el comando \`ipconfig /flushdns\` en la consola CMD y reintente.`,
    tags: ['VPN', 'Red', 'Windows', 'Mac', '2FA'],
    helpfulCount: 42,
    updatedAt: '2026-09-28',
    author: 'Carlos Mendoza',
  },
  {
    id: 'kb-2',
    title: 'Cómo solicitar licencias de software y accesos a herramientas de nube',
    category: 'Cuentas y Accesos',
    summary: 'Protocolo para autorizaciones de Figma, GitHub Copilot, Adobe Creative Cloud y entornos GCP/AWS.',
    content: `### Procedimiento de Solicitud de Licencias

Todas las solicitudes de licencias con costo deben contar con el visto bueno del Lead de su departamento.

#### Pasos a seguir:
1. Abra un ticket bajo la categoría **Acceso / Software**.
2. Indique:
   - Nombre de la herramienta y versión requerida.
   - Centro de costes del proyecto.
   - Justificación de uso y duración esperada.
3. El equipo de Soporte Nivel 1 procesará la aprobación en un plazo máximo de 24 horas laborales.`,
    tags: ['Licencias', 'Acceso', 'Software', 'Aprobaciones'],
    helpfulCount: 29,
    updatedAt: '2026-09-15',
    author: 'Elena Gómez',
  },
  {
    id: 'kb-3',
    title: 'Protocolo de respuesta ante sospechas de phishing o correos fraudulentos',
    category: 'Ciberseguridad',
    summary: 'Qué hacer si recibe un correo sospechoso pidiendo contraseñas, transferencias o archivos adjuntos sospechosos.',
    content: `### ¡No haga clic en ningún enlace sospechoso!

Si sospecha de un correo electrónico:
1. **No descargue archivos adjuntos** ni ingrese credenciales en páginas externas.
2. Utilice el botón **"Reportar Phishing"** integrado en Gmail/Outlook.
3. Si accidentalmente ingresó su contraseña, cámbiela de inmediato desde el portal SSO de seguridad.
4. Abra de inmediato un ticket con prioridad **Alta o Urgente** en la categoría Ciberseguridad.`,
    tags: ['Seguridad', 'Phishing', 'Email', 'Urgente'],
    helpfulCount: 65,
    updatedAt: '2026-10-01',
    author: 'Valeria Restrepo',
  },
  {
    id: 'kb-4',
    title: 'Configuración de monitores duales y estación de acoplamiento (Dock USB-C)',
    category: 'Hardware',
    summary: 'Resolución de problemas de visualización, parpadeo o pantallas negras en estaciones de trabajo Dell/Lenovo.',
    content: `### Pasos para estabilizar monitores secundarios:
1. Desconecte la estación de acoplamiento USB-C durante 15 segundos y vuelva a conectarla con el cable de corriente conectado a la pared.
2. En Windows, presione la combinación de teclas **Windows + Ctrl + Shift + B** para reiniciar el controlador de pantalla sin cerrar sus aplicaciones.
3. Actualice el firmware del dock a través de la herramienta oficial Lenovo Vantage o Dell Command Update.`,
    tags: ['Hardware', 'Monitores', 'Docking', 'USB-C'],
    helpfulCount: 18,
    updatedAt: '2026-09-20',
    author: 'Elena Gómez',
  },
];

export const CANNED_RESPONSES: CannedResponse[] = [
  {
    id: 'can-1',
    title: 'Solicitud de capturas y logs de error',
    category: 'Diagnóstico',
    content: 'Hola, para poder investigar y reproducir la incidencia con exactitud, ¿podrías facilitarnos una captura de pantalla del error completo y el archivo de log reciente? Esto nos ayudará a brindarte una solución mucho más ágil.',
  },
  {
    id: 'can-2',
    title: 'Solución aplicada y verificación de cierre',
    category: 'Resolución',
    content: 'Estimado/a, hemos aplicado la corrección correspondiente en la plataforma. Por favor realiza una prueba cuando tengas un momento y confírmanos si el inconveniente quedó completamente resuelto para proceder al cierre del ticket.',
  },
  {
    id: 'can-3',
    title: 'Escalado a equipo de infraestructura',
    category: 'Escalado',
    content: 'Hemos analizado la incidencia y transferido el caso a nuestros ingenieros de Infraestructura y Redes (Nivel 3). Están revisando los servidores en este momento. Te mantendremos informado con cada avance.',
  },
  {
    id: 'can-4',
    title: 'Credenciales temporales enviadas',
    category: 'Accesos',
    content: 'Tu cuenta ha sido reactivada con éxito. Hemos enviado un enlace seguro a tu correo alternativo para que puedas configurar tu nueva contraseña y verificar el doble factor de autenticación.',
  },
];
