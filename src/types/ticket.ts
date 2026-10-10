export type TicketStatus = 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketCategory =
  | 'hardware'
  | 'software'
  | 'network'
  | 'access'
  | 'billing'
  | 'general'
  | 'incident';

export type TicketDepartment =
  | 'Soporte TI'
  | 'Facturación'
  | 'Infraestructura'
  | 'Operaciones'
  | 'Ciberseguridad'
  | 'Atención al Cliente';

export interface RequesterInfo {
  name: string;
  email: string;
  avatar?: string;
  company?: string;
  role?: string;
  phone?: string;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: TicketDepartment;
  status: 'available' | 'busy' | 'away';
  activeTicketsCount: number;
}

export interface TicketAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'agent' | 'admin';
  senderAvatar?: string;
  type: 'public_reply' | 'internal_note';
  content: string;
  timestamp: string;
  attachments?: TicketAttachment[];
}

export interface TicketActivity {
  id: string;
  type: 'status_change' | 'priority_change' | 'assigned' | 'note_added' | 'created' | 'sla_breached' | 'time_logged';
  actor: string;
  description: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  department: TicketDepartment;
  requester: RequesterInfo;
  assignee?: SupportAgent;
  createdAt: string;
  updatedAt: string;
  slaDueAt: string; // ISO string
  firstResponseDueAt: string; // ISO string
  tags: string[];
  timeSpentMinutes: number;
  messages: TicketMessage[];
  activities: TicketActivity[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  tags: string[];
  helpfulCount: number;
  updatedAt: string;
  author: string;
}

export interface CannedResponse {
  id: string;
  title: string;
  category: string;
  content: string;
}

export type ViewMode = 'kanban' | 'list' | 'analytics' | 'knowledge' | 'team' | 'portal' | 'php';

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: 'agent' | 'admin' | 'customer';
  title: string;
  avatar: string;
}
