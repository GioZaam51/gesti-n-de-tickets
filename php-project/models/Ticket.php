<?php
/**
 * TicketDesk Pro - Modelo Ticket (PHP OOP + PDO)
 */

require_once __DIR__ . '/../config/database.php';

class Ticket {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Obtener listado de tickets con filtros y ordenamiento
     */
    public function getAll(array $filters = []): array {
        $sql = "SELECT t.*, a.name as assignee_name, a.avatar as assignee_avatar, a.role as assignee_role 
                FROM tickets t 
                LEFT JOIN agents a ON t.assignee_id = a.id 
                WHERE 1=1";
        $params = [];

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $sql .= " AND t.status = :status";
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['priority']) && $filters['priority'] !== 'all') {
            $sql .= " AND t.priority = :priority";
            $params[':priority'] = $filters['priority'];
        }

        if (!empty($filters['department']) && $filters['department'] !== 'all') {
            $sql .= " AND t.department = :department";
            $params[':department'] = $filters['department'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (t.id LIKE :search OR t.title LIKE :search OR t.description LIKE :search OR t.requester_name LIKE :search OR t.tags LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        // Ordenamiento
        $sortBy = $filters['sortBy'] ?? 'newest';
        switch ($sortBy) {
            case 'oldest':
                $sql .= " ORDER BY t.created_at ASC";
                break;
            case 'priority':
                $sql .= " ORDER BY FIELD(t.priority, 'urgent', 'high', 'medium', 'low')";
                break;
            case 'sla':
                $sql .= " ORDER BY t.sla_due_at ASC";
                break;
            case 'newest':
            default:
                $sql .= " ORDER BY t.created_at DESC";
                break;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Obtener ticket por ID con sus mensajes y actividades
     */
    public function getById(string $id): ?array {
        $sql = "SELECT t.*, a.name as assignee_name, a.email as assignee_email, a.avatar as assignee_avatar, a.role as assignee_role 
                FROM tickets t 
                LEFT JOIN agents a ON t.assignee_id = a.id 
                WHERE t.id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $ticket = $stmt->fetch();

        if (!$ticket) {
            return null;
        }

        // Obtener mensajes
        $stmtMsg = $this->db->prepare("SELECT * FROM ticket_messages WHERE ticket_id = :id ORDER BY created_at ASC");
        $stmtMsg->execute([':id' => $id]);
        $ticket['messages'] = $stmtMsg->fetchAll();

        // Obtener auditoría
        $stmtAct = $this->db->prepare("SELECT * FROM ticket_activities WHERE ticket_id = :id ORDER BY created_at DESC");
        $stmtAct->execute([':id' => $id]);
        $ticket['activities'] = $stmtAct->fetchAll();

        return $ticket;
    }

    /**
     * Crear un nuevo ticket con cálculo automático de SLA
     */
    public function create(array $data): string {
        $id = 'TCK-' . rand(1000, 9999);
        $priority = $data['priority'] ?? 'medium';

        // Horas para SLA según criticidad
        $slaHours = match ($priority) {
            'urgent' => 4,
            'high' => 8,
            'medium' => 24,
            default => 48,
        };

        $slaDueAt = date('Y-m-d H:i:s', strtotime("+{$slaHours} hours"));
        $firstResponseDueAt = date('Y-m-d H:i:s', strtotime("+1 hours"));

        $sql = "INSERT INTO tickets 
                (id, title, description, status, priority, category, department, requester_name, requester_email, requester_company, assignee_id, sla_due_at, first_response_due_at, tags)
                VALUES 
                (:id, :title, :description, 'open', :priority, :category, :department, :requester_name, :requester_email, :requester_company, :assignee_id, :sla_due_at, :first_response_due_at, :tags)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':id' => $id,
            ':title' => $data['title'],
            ':description' => $data['description'],
            ':priority' => $priority,
            ':category' => $data['category'] ?? 'software',
            ':department' => $data['department'] ?? 'Soporte TI',
            ':requester_name' => $data['requester_name'],
            ':requester_email' => $data['requester_email'],
            ':requester_company' => $data['requester_company'] ?? 'InnovaTech Hub',
            ':assignee_id' => !empty($data['assignee_id']) ? $data['assignee_id'] : null,
            ':sla_due_at' => $slaDueAt,
            ':first_response_due_at' => $firstResponseDueAt,
            ':tags' => $data['tags'] ?? 'General',
        ]);

        // Registrar actividad de creación
        $this->logActivity($id, 'created', $data['requester_name'], "Ticket registrado con prioridad " . strtoupper($priority));

        // Registrar primer mensaje con la descripción
        $this->addMessage($id, $data['requester_name'], 'customer', 'public_reply', $data['description']);

        return $id;
    }

    /**
     * Actualizar estado del ticket
     */
    public function updateStatus(string $id, string $status, string $actor = 'Sistema'): bool {
        $stmt = $this->db->prepare("UPDATE tickets SET status = :status, updated_at = NOW() WHERE id = :id");
        $res = $stmt->execute([':status' => $status, ':id' => $id]);

        if ($res) {
            $this->logActivity($id, 'status_change', $actor, "Estado actualizado a '{$status}'");
        }
        return $res;
    }

    /**
     * Reasignar ticket a técnico
     */
    public function assign(string $id, ?int $agentId, string $actor = 'Coordinador'): bool {
        $stmt = $this->db->prepare("UPDATE tickets SET assignee_id = :agent_id, updated_at = NOW() WHERE id = :id");
        $res = $stmt->execute([':agent_id' => $agentId, ':id' => $id]);

        if ($res) {
            $desc = $agentId ? "Ticket reasignado a agente #{$agentId}" : "Ticket sin asignar";
            $this->logActivity($id, 'assigned', $actor, $desc);
        }
        return $res;
    }

    /**
     * Agregar respuesta pública o nota interna
     */
    public function addMessage(string $ticketId, string $senderName, string $role, string $type, string $content): int {
        $stmt = $this->db->prepare("INSERT INTO ticket_messages (ticket_id, sender_name, sender_role, message_type, content) VALUES (:ticket_id, :sender_name, :sender_role, :message_type, :content)");
        $stmt->execute([
            ':ticket_id' => $ticketId,
            ':sender_name' => $senderName,
            ':sender_role' => $role,
            ':message_type' => $type,
            ':content' => $content,
        ]);

        $msgId = (int)$this->db->lastInsertId();

        // Actualizar actividad y timestamp de ticket
        $actDesc = ($type === 'internal_note') ? "Nota interna agregada por {$senderName}" : "Respuesta enviada por {$senderName}";
        $this->logActivity($ticketId, 'message_added', $senderName, $actDesc);

        $this->db->prepare("UPDATE tickets SET updated_at = NOW() WHERE id = :id")->execute([':id' => $ticketId]);

        return $msgId;
    }

    /**
     * Registrar tiempo dedicado en minutos
     */
    public function logTime(string $id, int $minutes, string $actor = 'Técnico'): bool {
        $stmt = $this->db->prepare("UPDATE tickets SET time_spent_minutes = time_spent_minutes + :minutes, updated_at = NOW() WHERE id = :id");
        $res = $stmt->execute([':minutes' => $minutes, ':id' => $id]);

        if ($res) {
            $this->logActivity($id, 'time_logged', $actor, "Registró {$minutes} minutos de trabajo técnico");
        }
        return $res;
    }

    /**
     * Obtener estadísticas de helpdesk y SLA
     */
    public function getStats(): array {
        $total = (int)$this->db->query("SELECT COUNT(*) FROM tickets")->fetchColumn();
        $open = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE status = 'open'")->fetchColumn();
        $inProgress = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE status = 'in_progress'")->fetchColumn();
        $waitingClient = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE status = 'waiting_client'")->fetchColumn();
        $resolved = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE status = 'resolved'")->fetchColumn();
        $closed = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE status = 'closed'")->fetchColumn();
        $urgent = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE priority = 'urgent' AND status NOT IN ('resolved', 'closed')")->fetchColumn();

        // Tickets con SLA vencido
        $slaBreached = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE status NOT IN ('resolved', 'closed') AND sla_due_at < NOW()")->fetchColumn();
        $slaComplianceRate = $total > 0 ? round((($total - $slaBreached) / $total) * 100) : 100;

        return [
            'total' => $total,
            'open' => $open,
            'inProgress' => $inProgress,
            'waitingClient' => $waitingClient,
            'resolved' => $resolved,
            'closed' => $closed,
            'urgent' => $urgent,
            'slaBreached' => $slaBreached,
            'slaComplianceRate' => $slaComplianceRate,
            'mttrHours' => 3.8,
        ];
    }

    private function logActivity(string $ticketId, string $type, string $actor, string $description): void {
        $stmt = $this->db->prepare("INSERT INTO ticket_activities (ticket_id, activity_type, actor, description) VALUES (:ticket_id, :activity_type, :actor, :description)");
        $stmt->execute([
            ':ticket_id' => $ticketId,
            ':activity_type' => $type,
            ':actor' => $actor,
            ':description' => $description,
        ]);
    }
}
