import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketDepartment,
  SupportAgent,
  TicketMessage,
  ViewMode,
  UserPersona,
  KnowledgeArticle,
  CannedResponse,
} from '../types/ticket';
import {
  INITIAL_TICKETS,
  SUPPORT_AGENTS,
  USER_PERSONAS,
  KNOWLEDGE_ARTICLES,
  CANNED_RESPONSES,
} from '../data/mockData';

interface FilterState {
  search: string;
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
  category: TicketCategory | 'all';
  department: TicketDepartment | 'all';
  assigneeId: string | 'all';
  sortBy: 'newest' | 'oldest' | 'priority' | 'sla';
}

interface TicketContextType {
  tickets: Ticket[];
  filteredTickets: Ticket[];
  agents: SupportAgent[];
  knowledgeArticles: KnowledgeArticle[];
  cannedResponses: CannedResponse[];
  currentPersona: UserPersona;
  setCurrentPersona: (persona: UserPersona) => void;
  viewMode: ViewMode;
  setViewMode: (view: ViewMode) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  selectedTicketIds: string[];
  toggleSelectTicket: (id: string) => void;
  selectAllTickets: (select: boolean) => void;

  // Actions
  createTicket: (newTicketData: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    department: TicketDepartment;
    requesterName: string;
    requesterEmail: string;
    requesterCompany?: string;
    tags?: string[];
    assigneeId?: string;
  }) => Ticket;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  updateTicketPriority: (ticketId: string, priority: TicketPriority) => void;
  assignTicket: (ticketId: string, agentId: string | null) => void;
  addMessage: (
    ticketId: string,
    content: string,
    type: 'public_reply' | 'internal_note',
    attachments?: { id: string; name: string; size: string; type: string }[]
  ) => void;
  logTime: (ticketId: string, minutes: number) => void;
  deleteTicket: (ticketId: string) => void;
  bulkUpdateStatus: (status: TicketStatus) => void;
  bulkAssign: (agentId: string) => void;
  bulkDelete: () => void;
  resetToMockData: () => void;
  exportTicketsJSON: () => void;
  exportTicketsCSV: () => void;
  importTickets: (jsonString: string) => boolean;
  addKnowledgeArticle: (article: Omit<KnowledgeArticle, 'id' | 'updatedAt' | 'helpfulCount'>) => void;
  markArticleHelpful: (id: string) => void;

  // Stats calculation
  stats: {
    total: number;
    open: number;
    inProgress: number;
    waitingClient: number;
    resolved: number;
    closed: number;
    urgent: number;
    slaBreachedCount: number;
    slaComplianceRate: number;
    avgResolutionTimeHours: number;
  };
}

const STORAGE_KEY_TICKETS = 'ticketdesk_tickets_v1';
const STORAGE_KEY_PERSONA = 'ticketdesk_persona_v1';
const STORAGE_KEY_ARTICLES = 'ticketdesk_articles_v1';

const initialFilters: FilterState = {
  search: '',
  status: 'all',
  priority: 'all',
  category: 'all',
  department: 'all',
  assigneeId: 'all',
  sortBy: 'newest',
};

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TICKETS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_TICKETS;
  });

  const [agents] = useState<SupportAgent[]>(SUPPORT_AGENTS);

  const [currentPersona, setCurrentPersona] = useState<UserPersona>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PERSONA);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return USER_PERSONAS[0];
  });

  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ARTICLES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return KNOWLEDGE_ARTICLES;
  });

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

  // Persist tickets
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
    } catch (err) {
      console.error('Error saving tickets:', err);
    }
  }, [tickets]);

  // Persist persona
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PERSONA, JSON.stringify(currentPersona));
    } catch (err) {
      console.error('Error saving persona:', err);
    }
  }, [currentPersona]);

  // Persist KB articles
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(knowledgeArticles));
    } catch (err) {
      console.error('Error saving articles:', err);
    }
  }, [knowledgeArticles]);

  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    return tickets.find((t) => t.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

  const setSelectedTicket = (ticket: Ticket | null) => {
    setSelectedTicketId(ticket ? ticket.id : null);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Filtered & sorted tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // If in customer portal mode, filter by requester email of current persona or show all if admin
    if (viewMode === 'portal' && currentPersona.role === 'customer') {
      result = result.filter(
        (t) =>
          t.requester.email.toLowerCase() === currentPersona.email.toLowerCase() ||
          t.requester.company?.toLowerCase() === 'innovatech hub'
      );
    }

    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(query) ||
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.requester.name.toLowerCase().includes(query) ||
          t.requester.email.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          t.assignee?.name.toLowerCase().includes(query)
      );
    }

    if (filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters.priority !== 'all') {
      result = result.filter((t) => t.priority === filters.priority);
    }

    if (filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category);
    }

    if (filters.department !== 'all') {
      result = result.filter((t) => t.department === filters.department);
    }

    if (filters.assigneeId !== 'all') {
      if (filters.assigneeId === 'unassigned') {
        result = result.filter((t) => !t.assignee);
      } else {
        result = result.filter((t) => t.assignee?.id === filters.assigneeId);
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (filters.sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (filters.sortBy === 'priority') {
        const priorityScore: Record<TicketPriority, number> = {
          urgent: 4,
          high: 3,
          medium: 2,
          low: 1,
        };
        return priorityScore[b.priority] - priorityScore[a.priority];
      }
      if (filters.sortBy === 'sla') {
        return new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime();
      }
      return 0;
    });

    return result;
  }, [tickets, filters, viewMode, currentPersona]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'open').length;
    const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
    const waitingClient = tickets.filter((t) => t.status === 'waiting_client').length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;
    const closed = tickets.filter((t) => t.status === 'closed').length;
    const urgent = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length;

    const now = new Date().getTime();
    const slaBreachedCount = tickets.filter((t) => {
      if (t.status === 'resolved' || t.status === 'closed') return false;
      return new Date(t.slaDueAt).getTime() < now;
    }).length;

    const resolvedOrClosedCount = resolved + closed;
    const slaComplianceRate =
      total > 0
        ? Math.round(((total - slaBreachedCount) / total) * 100)
        : 100;

    const avgResolutionTimeHours = 4.2;

    return {
      total,
      open,
      inProgress,
      waitingClient,
      resolved,
      closed,
      urgent,
      slaBreachedCount,
      slaComplianceRate,
      avgResolutionTimeHours,
    };
  }, [tickets]);

  // Actions
  const createTicket = (data: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    department: TicketDepartment;
    requesterName: string;
    requesterEmail: string;
    requesterCompany?: string;
    tags?: string[];
    assigneeId?: string;
  }): Ticket => {
    const now = new Date();
    const nextNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `TCK-${nextNum}`;

    let assignedAgent: SupportAgent | undefined = undefined;
    if (data.assigneeId) {
      assignedAgent = agents.find((a) => a.id === data.assigneeId);
    }

    // SLA calculation based on priority
    let hoursToSla = 24;
    let hoursToFirstResponse = 4;
    if (data.priority === 'urgent') {
      hoursToSla = 4;
      hoursToFirstResponse = 1;
    } else if (data.priority === 'high') {
      hoursToSla = 8;
      hoursToFirstResponse = 2;
    } else if (data.priority === 'medium') {
      hoursToSla = 24;
      hoursToFirstResponse = 6;
    } else {
      hoursToSla = 48;
      hoursToFirstResponse = 12;
    }

    const slaDueAt = new Date(now.getTime() + hoursToSla * 3600 * 1000).toISOString();
    const firstResponseDueAt = new Date(now.getTime() + hoursToFirstResponse * 3600 * 1000).toISOString();

    const newTicket: Ticket = {
      id: newId,
      title: data.title,
      description: data.description,
      status: 'open',
      priority: data.priority,
      category: data.category,
      department: data.department,
      requester: {
        name: data.requesterName,
        email: data.requesterEmail,
        company: data.requesterCompany || 'InnovaTech Hub',
        role: 'Empleado / Cliente',
      },
      assignee: assignedAgent,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      slaDueAt,
      firstResponseDueAt,
      tags: data.tags || [data.category.toUpperCase()],
      timeSpentMinutes: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: currentPersona.id,
          senderName: data.requesterName,
          senderRole: currentPersona.role === 'customer' ? 'customer' : 'agent',
          type: 'public_reply',
          content: data.description,
          timestamp: now.toISOString(),
        },
      ],
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'created',
          actor: currentPersona.name,
          description: `Ticket registrado con prioridad ${data.priority.toUpperCase()}`,
          timestamp: now.toISOString(),
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const statusLabels: Record<TicketStatus, string> = {
          open: 'Abierto',
          in_progress: 'En Progreso',
          waiting_client: 'Esperando Respuesta del Cliente',
          resolved: 'Resuelto',
          closed: 'Cerrado',
        };
        const newActivity = {
          id: `act-${Date.now()}`,
          type: 'status_change' as const,
          actor: currentPersona.name,
          description: `Estado actualizado a "${statusLabels[newStatus]}"`,
          timestamp: now,
        };
        return {
          ...t,
          status: newStatus,
          updatedAt: now,
          activities: [newActivity, ...t.activities],
        };
      })
    );
  };

  const updateTicketPriority = (ticketId: string, newPriority: TicketPriority) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const priorityLabels: Record<TicketPriority, string> = {
          low: 'Baja',
          medium: 'Media',
          high: 'Alta',
          urgent: 'Urgente',
        };
        const newActivity = {
          id: `act-${Date.now()}`,
          type: 'priority_change' as const,
          actor: currentPersona.name,
          description: `Prioridad cambiada a ${priorityLabels[newPriority]}`,
          timestamp: now,
        };
        return {
          ...t,
          priority: newPriority,
          updatedAt: now,
          activities: [newActivity, ...t.activities],
        };
      })
    );
  };

  const assignTicket = (ticketId: string, agentId: string | null) => {
    const now = new Date().toISOString();
    const assignedAgent = agentId ? agents.find((a) => a.id === agentId) : undefined;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const newActivity = {
          id: `act-${Date.now()}`,
          type: 'assigned' as const,
          actor: currentPersona.name,
          description: assignedAgent
            ? `Asignado a ${assignedAgent.name} (${assignedAgent.role})`
            : 'Asignación eliminada (Sin asignar)',
          timestamp: now,
        };
        return {
          ...t,
          assignee: assignedAgent,
          updatedAt: now,
          activities: [newActivity, ...t.activities],
        };
      })
    );
  };

  const addMessage = (
    ticketId: string,
    content: string,
    type: 'public_reply' | 'internal_note',
    attachments?: { id: string; name: string; size: string; type: string }[]
  ) => {
    const now = new Date().toISOString();
    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentPersona.id,
      senderName: currentPersona.name,
      senderRole: currentPersona.role,
      senderAvatar: currentPersona.avatar,
      type,
      content,
      timestamp: now,
      attachments,
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;

        const newActivity = {
          id: `act-${Date.now()}`,
          type: type === 'internal_note' ? ('note_added' as const) : ('status_change' as const),
          actor: currentPersona.name,
          description:
            type === 'internal_note'
              ? 'Añadió una nota interna de equipo'
              : 'Respondió al solicitante',
          timestamp: now,
        };

        // If ticket was open and an agent replies, change status to in_progress or waiting_client
        let newStatus = t.status;
        if (currentPersona.role !== 'customer' && type === 'public_reply') {
          if (t.status === 'open') {
            newStatus = 'in_progress';
          }
        } else if (currentPersona.role === 'customer' && t.status === 'waiting_client') {
          newStatus = 'in_progress';
        }

        return {
          ...t,
          status: newStatus,
          updatedAt: now,
          messages: [...t.messages, newMessage],
          activities: [newActivity, ...t.activities],
        };
      })
    );
  };

  const logTime = (ticketId: string, minutes: number) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const newTotal = (t.timeSpentMinutes || 0) + minutes;
        const newActivity = {
          id: `act-${Date.now()}`,
          type: 'time_logged' as const,
          actor: currentPersona.name,
          description: `Registró ${minutes} minutos dedicados (Total: ${newTotal}m)`,
          timestamp: now,
        };
        return {
          ...t,
          timeSpentMinutes: newTotal,
          updatedAt: now,
          activities: [newActivity, ...t.activities],
        };
      })
    );
  };

  const deleteTicket = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    if (selectedTicketId === ticketId) {
      setSelectedTicketId(null);
    }
  };

  const toggleSelectTicket = (id: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllTickets = (select: boolean) => {
    if (select) {
      setSelectedTicketIds(filteredTickets.map((t) => t.id));
    } else {
      setSelectedTicketIds([]);
    }
  };

  const bulkUpdateStatus = (status: TicketStatus) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (!selectedTicketIds.includes(t.id)) return t;
        return {
          ...t,
          status,
          updatedAt: now,
          activities: [
            {
              id: `act-${Date.now()}-${t.id}`,
              type: 'status_change',
              actor: currentPersona.name,
              description: `Actualización masiva de estado a ${status}`,
              timestamp: now,
            },
            ...t.activities,
          ],
        };
      })
    );
    setSelectedTicketIds([]);
  };

  const bulkAssign = (agentId: string) => {
    const now = new Date().toISOString();
    const assignedAgent = agents.find((a) => a.id === agentId);
    if (!assignedAgent) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (!selectedTicketIds.includes(t.id)) return t;
        return {
          ...t,
          assignee: assignedAgent,
          updatedAt: now,
          activities: [
            {
              id: `act-${Date.now()}-${t.id}`,
              type: 'assigned',
              actor: currentPersona.name,
              description: `Asignación masiva a ${assignedAgent.name}`,
              timestamp: now,
            },
            ...t.activities,
          ],
        };
      })
    );
    setSelectedTicketIds([]);
  };

  const bulkDelete = () => {
    setTickets((prev) => prev.filter((t) => !selectedTicketIds.includes(t.id)));
    setSelectedTicketIds([]);
  };

  const resetToMockData = () => {
    setTickets(INITIAL_TICKETS);
    setKnowledgeArticles(KNOWLEDGE_ARTICLES);
    setSelectedTicketIds([]);
    setSelectedTicketId(null);
  };

  const exportTicketsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tickets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ticketdesk-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportTicketsCSV = () => {
    const headers = ['ID', 'Titulo', 'Estado', 'Prioridad', 'Categoria', 'Departamento', 'Solicitante', 'Asignado', 'Creado', 'SLA_Limite'];
    const rows = tickets.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.category,
      t.department,
      `"${t.requester.name}"`,
      `"${t.assignee ? t.assignee.name : 'Sin asignar'}"`,
      t.createdAt,
      t.slaDueAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute('download', `ticketdesk-tickets-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importTickets = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].title) {
        setTickets(parsed);
        return true;
      }
    } catch (e) {
      console.error('Error importing tickets:', e);
    }
    return false;
  };

  const addKnowledgeArticle = (data: Omit<KnowledgeArticle, 'id' | 'updatedAt' | 'helpfulCount'>) => {
    const newArt: KnowledgeArticle = {
      ...data,
      id: `kb-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
      helpfulCount: 0,
    };
    setKnowledgeArticles((prev) => [newArt, ...prev]);
  };

  const markArticleHelpful = (id: string) => {
    setKnowledgeArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, helpfulCount: a.helpfulCount + 1 } : a))
    );
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        filteredTickets,
        agents,
        knowledgeArticles,
        cannedResponses: CANNED_RESPONSES,
        currentPersona,
        setCurrentPersona,
        viewMode,
        setViewMode,
        filters,
        setFilters,
        resetFilters,
        selectedTicket,
        setSelectedTicket,
        isCreateModalOpen,
        setIsCreateModalOpen,
        selectedTicketIds,
        toggleSelectTicket,
        selectAllTickets,
        createTicket,
        updateTicketStatus,
        updateTicketPriority,
        assignTicket,
        addMessage,
        logTime,
        deleteTicket,
        bulkUpdateStatus,
        bulkAssign,
        bulkDelete,
        resetToMockData,
        exportTicketsJSON,
        exportTicketsCSV,
        importTickets,
        addKnowledgeArticle,
        markArticleHelpful,
        stats,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
