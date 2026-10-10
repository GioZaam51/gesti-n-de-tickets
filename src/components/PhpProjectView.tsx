import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Database,
  Terminal,
  Folder,
  Layers,
  Server,
  Code2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import JSZip from 'jszip';

interface FileItem {
  name: string;
  path: string;
  language: string;
  category: string;
  content: string;
}

export const PhpProjectView: React.FC = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [isZipping, setIsZipping] = useState(false);

  const phpFiles: FileItem[] = [
    {
      name: 'index.php',
      path: 'index.php',
      language: 'php',
      category: 'Frontend & Controlador',
      content: `<?php
/**
 * TicketDesk Pro - Sistema de Gestión de Tickets (PHP + MySQL + Tailwind)
 * Aplicación Web Completa en PHP 8+
 */

require_once __DIR__ . '/models/Ticket.php';
require_once __DIR__ . '/models/Agent.php';

$ticketModel = new Ticket();
$agentModel = new Agent();

// Manejo de acciones POST tradicionales
$feedback = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'create_ticket') {
        $newId = $ticketModel->create([
            'title' => $_POST['title'] ?? '',
            'description' => $_POST['description'] ?? '',
            'category' => $_POST['category'] ?? 'software',
            'priority' => $_POST['priority'] ?? 'medium',
            'department' => $_POST['department'] ?? 'Soporte TI',
            'requester_name' => $_POST['requester_name'] ?? 'Usuario',
            'requester_email' => $_POST['requester_email'] ?? 'usuario@empresa.com',
            'requester_company' => $_POST['requester_company'] ?? 'InnovaTech Hub',
            'assignee_id' => !empty($_POST['assignee_id']) ? (int)$_POST['assignee_id'] : null,
            'tags' => $_POST['tags'] ?? 'General',
        ]);
        $feedback = "Ticket {$newId} registrado exitosamente.";
    } elseif ($_POST['action'] === 'update_status') {
        $ticketModel->updateStatus($_POST['ticket_id'], $_POST['status'], 'Agente Web');
        $feedback = "Estado del ticket {$_POST['ticket_id']} actualizado.";
    }
}

// Cargar datos
$filterStatus = $_GET['status'] ?? 'all';
$filterPriority = $_GET['priority'] ?? 'all';
$filterSearch = $_GET['search'] ?? '';

$tickets = $ticketModel->getAll([
    'status' => $filterStatus,
    'priority' => $filterPriority,
    'search' => $filterSearch,
]);

$stats = $ticketModel->getStats();
$agents = $agentModel->getAll();

// Agrupar tickets para el tablero Kanban
$kanbanColumns = [
    'open' => ['title' => 'Abiertos', 'color' => 'blue', 'tickets' => []],
    'in_progress' => ['title' => 'En Progreso', 'color' => 'indigo', 'tickets' => []],
    'waiting_client' => ['title' => 'Esperando Cliente', 'color' => 'amber', 'tickets' => []],
    'resolved' => ['title' => 'Resueltos', 'color' => 'emerald', 'tickets' => []],
    'closed' => ['title' => 'Cerrados', 'color' => 'slate', 'tickets' => []],
];

foreach ($tickets as $t) {
    if (isset($kanbanColumns[$t['status']])) {
        $kanbanColumns[$t['status']]['tickets'][] = $t;
    }
}
?>
<!DOCTYPE html>
<html lang="es" class="h-full bg-slate-50">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TicketDesk Pro - PHP Helpdesk</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style> body { font-family: 'Plus Jakarta Sans', sans-serif; } </style>
</head>
<body class="min-h-full flex flex-col text-slate-800">

    <header class="bg-slate-900 text-white sticky top-0 z-30 border-b border-slate-800 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-md">
                        TD
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-lg text-white">TicketDesk PHP</span>
                            <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PHP 8.2 + PDO</span>
                        </div>
                        <p class="text-xs text-slate-400">Sistema de Gestión de Tickets & Soporte Técnico</p>
                    </div>
                </div>

                <button onclick="document.getElementById('modal-new-ticket').classList.remove('hidden')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer">
                    + Nuevo Ticket
                </button>
            </div>
        </div>
    </header>

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <?php if ($feedback): ?>
            <div class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
                <span>✓ <?= htmlspecialchars($feedback) ?></span>
                <button onclick="this.parentElement.remove()" class="text-emerald-600 hover:text-emerald-900">✕</button>
            </div>
        <?php endif; ?>

        <!-- KPIs PHP -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span class="text-xs text-slate-500 font-medium block">Total Tickets</span>
                <span class="text-2xl font-bold text-slate-900"><?= $stats['total'] ?></span>
            </div>
            <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span class="text-xs text-blue-600 font-medium block">Abiertos</span>
                <span class="text-2xl font-bold text-blue-700"><?= $stats['open'] ?></span>
            </div>
            <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span class="text-xs text-indigo-600 font-medium block">En Progreso</span>
                <span class="text-2xl font-bold text-indigo-700"><?= $stats['inProgress'] ?></span>
            </div>
            <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span class="text-xs text-amber-600 font-medium block">En Espera</span>
                <span class="text-2xl font-bold text-amber-700"><?= $stats['waitingClient'] ?></span>
            </div>
            <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span class="text-xs text-emerald-600 font-medium block">Resueltos</span>
                <span class="text-2xl font-bold text-emerald-700"><?= $stats['resolved'] + $stats['closed'] ?></span>
            </div>
            <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span class="text-xs text-rose-600 font-medium block">Cumplimiento SLA</span>
                <span class="text-2xl font-bold text-slate-900"><?= $stats['slaComplianceRate'] ?>%</span>
            </div>
        </div>

        <!-- Tablero Kanban PHP -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start pb-8">
            <?php foreach ($kanbanColumns as $colKey => $col): ?>
                <div class="bg-slate-100 rounded-xl border border-slate-200 shadow-2xs min-h-[460px] overflow-hidden flex flex-col">
                    <div class="p-3 border-b bg-white flex items-center justify-between text-xs font-bold text-slate-700">
                        <div class="flex items-center gap-2">
                            <span><?= $col['title'] ?></span>
                            <span class="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600"><?= count($col['tickets']) ?></span>
                        </div>
                    </div>

                    <div class="p-2.5 space-y-2.5 flex-1 overflow-y-auto">
                        <?php if (empty($col['tickets'])): ?>
                            <div class="h-28 flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-lg">
                                Sin tickets
                            </div>
                        <?php else: ?>
                            <?php foreach ($col['tickets'] as $ticket): ?>
                                <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:border-indigo-400 transition-all text-xs">
                                    <div class="flex items-center justify-between mb-1.5">
                                        <span class="font-mono font-bold text-slate-500 text-[11px]"><?= htmlspecialchars($ticket['id']) ?></span>
                                        <span class="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase
                                            <?= $ticket['priority'] === 'urgent' ? 'bg-rose-50 text-rose-700' : ($ticket['priority'] === 'high' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700') ?>">
                                            <?= htmlspecialchars($ticket['priority']) ?>
                                        </span>
                                    </div>
                                    <h4 class="font-bold text-slate-900 mb-1 leading-snug line-clamp-2">
                                        <?= htmlspecialchars($ticket['title']) ?>
                                    </h4>
                                    <p class="text-[11px] text-slate-500 mb-2 truncate">
                                        <?= htmlspecialchars($ticket['requester_name']) ?> (<?= htmlspecialchars($ticket['department']) ?>)
                                    </p>
                                    <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                        <span>SLA: <?= date('d/m H:i', strtotime($ticket['sla_due_at'])) ?></span>
                                        <span><?= !empty($ticket['assignee_name']) ? htmlspecialchars($ticket['assignee_name']) : 'Sin asignar' ?></span>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </main>
</body>
</html>`,
    },
    {
      name: 'config/database.php',
      path: 'config/database.php',
      language: 'php',
      category: 'Conexión & Configuración',
      content: `<?php
/**
 * TicketDesk Pro - Conexión Segura con PDO
 */

class Database {
    private static ?PDO $instance = null;

    private static string $host = '127.0.0.1';
    private static string $port = '3306';
    private static string $dbName = 'ticketdesk_db';
    private static string $user = 'root';
    private static string $pass = '';

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $host = getenv('DB_HOST') ?: self::$host;
            $port = getenv('DB_PORT') ?: self::$port;
            $dbName = getenv('DB_NAME') ?: self::$dbName;
            $user = getenv('DB_USER') ?: self::$user;
            $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : self::$pass;

            $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";

            try {
                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'error' => 'Error de conexión a base de datos: ' . $e->getMessage()
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        return self::$instance;
    }
}`,
    },
    {
      name: 'models/Ticket.php',
      path: 'models/Ticket.php',
      language: 'php',
      category: 'Modelo de Negocio & SLA',
      content: `<?php
/**
 * TicketDesk Pro - Modelo Ticket (PHP OOP + PDO)
 */

require_once __DIR__ . '/../config/database.php';

class Ticket {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

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
            $sql .= " AND (t.id LIKE :search OR t.title LIKE :search OR t.description LIKE :search OR t.requester_name LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        $sql .= " ORDER BY t.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getById(string $id): ?array {
        $stmt = $this->db->prepare("SELECT t.*, a.name as assignee_name, a.email as assignee_email, a.avatar as assignee_avatar, a.role as assignee_role 
                                    FROM tickets t 
                                    LEFT JOIN agents a ON t.assignee_id = a.id 
                                    WHERE t.id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $ticket = $stmt->fetch();
        if (!$ticket) return null;

        $stmtMsg = $this->db->prepare("SELECT * FROM ticket_messages WHERE ticket_id = :id ORDER BY created_at ASC");
        $stmtMsg->execute([':id' => $id]);
        $ticket['messages'] = $stmtMsg->fetchAll();

        $stmtAct = $this->db->prepare("SELECT * FROM ticket_activities WHERE ticket_id = :id ORDER BY created_at DESC");
        $stmtAct->execute([':id' => $id]);
        $ticket['activities'] = $stmtAct->fetchAll();

        return $ticket;
    }

    public function create(array $data): string {
        $id = 'TCK-' . rand(1000, 9999);
        $priority = $data['priority'] ?? 'medium';

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

        $this->addMessage($id, $data['requester_name'], 'customer', 'public_reply', $data['description']);
        return $id;
    }

    public function updateStatus(string $id, string $status, string $actor = 'Sistema'): bool {
        $stmt = $this->db->prepare("UPDATE tickets SET status = :status, updated_at = NOW() WHERE id = :id");
        return $stmt->execute([':status' => $status, ':id' => $id]);
    }

    public function addMessage(string $ticketId, string $senderName, string $role, string $type, string $content): int {
        $stmt = $this->db->prepare("INSERT INTO ticket_messages (ticket_id, sender_name, sender_role, message_type, content) VALUES (:ticket_id, :sender_name, :sender_role, :message_type, :content)");
        $stmt->execute([
            ':ticket_id' => $ticketId,
            ':sender_name' => $senderName,
            ':sender_role' => $role,
            ':message_type' => $type,
            ':content' => $content,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function getStats(): array {
        $total = (int)$this->db->query("SELECT COUNT(*) FROM tickets")->fetchColumn();
        $open = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE status = 'open'")->fetchColumn();
        $inProgress = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE status = 'in_progress'")->fetchColumn();
        $waitingClient = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE status = 'waiting_client'")->fetchColumn();
        $resolved = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE status = 'resolved'")->fetchColumn();
        $closed = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE status = 'closed'")->fetchColumn();

        $slaBreached = (int)$this->db->query("SELECT COUNT(*) FROM tickets WHERE status NOT IN ('resolved', 'closed') AND sla_due_at < NOW()")->fetchColumn();
        $slaComplianceRate = $total > 0 ? round((($total - $slaBreached) / $total) * 100) : 100;

        return [
            'total' => $total,
            'open' => $open,
            'inProgress' => $inProgress,
            'waitingClient' => $waitingClient,
            'resolved' => $resolved,
            'closed' => $closed,
            'slaComplianceRate' => $slaComplianceRate,
        ];
    }
}`,
    },
    {
      name: 'models/Agent.php',
      path: 'models/Agent.php',
      language: 'php',
      category: 'Modelo Agentes',
      content: `<?php
/**
 * TicketDesk Pro - Modelo Agent (PHP OOP)
 */

require_once __DIR__ . '/../config/database.php';

class Agent {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getAll(): array {
        $sql = "SELECT a.*, 
                COUNT(CASE WHEN t.status IN ('open', 'in_progress', 'waiting_client') THEN 1 END) as active_tickets 
                FROM agents a 
                LEFT JOIN tickets t ON a.id = t.assignee_id 
                GROUP BY a.id 
                ORDER BY a.name ASC";
        return $this->db->query($sql)->fetchAll();
    }
}`,
    },
    {
      name: 'api/tickets.php',
      path: 'api/tickets.php',
      language: 'php',
      category: 'REST API',
      content: `<?php
/**
 * TicketDesk Pro - API REST de Tickets (PHP JSON)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../models/Ticket.php';

$ticketModel = new Ticket();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (!empty($_GET['id'])) {
                $ticket = $ticketModel->getById($_GET['id']);
                if (!$ticket) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Ticket no encontrado']);
                    exit;
                }
                echo json_encode(['success' => true, 'data' => $ticket], JSON_UNESCAPED_UNICODE);
            } else {
                $list = $ticketModel->getAll($_GET);
                echo json_encode(['success' => true, 'count' => count($list), 'data' => $list], JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

            if (isset($_GET['action']) && $_GET['action'] === 'message') {
                $msgId = $ticketModel->addMessage(
                    $input['ticket_id'],
                    $input['sender_name'] ?? 'Agente',
                    $input['sender_role'] ?? 'agent',
                    $input['message_type'] ?? 'public_reply',
                    $input['content']
                );
                echo json_encode(['success' => true, 'message_id' => $msgId]);
                exit;
            }

            $newId = $ticketModel->create($input);
            http_response_code(201);
            echo json_encode(['success' => true, 'ticket_id' => $newId]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            if (isset($input['status'])) {
                $ticketModel->updateStatus($input['id'], $input['status'], $input['actor'] ?? 'Agente');
            }
            echo json_encode(['success' => true, 'message' => 'Actualizado']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}`,
    },
    {
      name: 'api/stats.php',
      path: 'api/stats.php',
      language: 'php',
      category: 'REST API',
      content: `<?php
/**
 * TicketDesk Pro - API REST de Métricas y SLA (PHP)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../models/Ticket.php';

try {
    $ticketModel = new Ticket();
    $stats = $ticketModel->getStats();
    echo json_encode(['success' => true, 'data' => $stats], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}`,
    },
    {
      name: 'database.sql',
      path: 'database.sql',
      language: 'sql',
      category: 'Base de Datos MySQL',
      content: `-- TicketDesk Pro - Base de Datos MySQL / MariaDB
CREATE DATABASE IF NOT EXISTS \`ticketdesk_db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`ticketdesk_db\`;

-- 1. Tabla de Agentes Técnicos
CREATE TABLE IF NOT EXISTS \`agents\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`name\` VARCHAR(100) NOT NULL,
    \`email\` VARCHAR(120) NOT NULL UNIQUE,
    \`avatar\` VARCHAR(255) DEFAULT NULL,
    \`role\` VARCHAR(80) NOT NULL DEFAULT 'Técnico de Soporte',
    \`department\` VARCHAR(60) NOT NULL DEFAULT 'Soporte TI',
    \`status\` ENUM('available', 'busy', 'away') DEFAULT 'available',
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Tickets
CREATE TABLE IF NOT EXISTS \`tickets\` (
    \`id\` VARCHAR(20) PRIMARY KEY,
    \`title\` VARCHAR(255) NOT NULL,
    \`description\` TEXT NOT NULL,
    \`status\` ENUM('open', 'in_progress', 'waiting_client', 'resolved', 'closed') DEFAULT 'open',
    \`priority\` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    \`category\` VARCHAR(50) NOT NULL DEFAULT 'software',
    \`department\` VARCHAR(60) NOT NULL DEFAULT 'Soporte TI',
    \`requester_name\` VARCHAR(100) NOT NULL,
    \`requester_email\` VARCHAR(120) NOT NULL,
    \`requester_company\` VARCHAR(120) DEFAULT NULL,
    \`assignee_id\` INT DEFAULT NULL,
    \`sla_due_at\` DATETIME NOT NULL,
    \`first_response_due_at\` DATETIME DEFAULT NULL,
    \`time_spent_minutes\` INT DEFAULT 0,
    \`tags\` VARCHAR(255) DEFAULT '',
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX \`idx_status\` (\`status\`),
    INDEX \`idx_priority\` (\`priority\`),
    CONSTRAINT \`fk_tickets_assignee\` FOREIGN KEY (\`assignee_id\`) REFERENCES \`agents\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Mensajes (Respuestas & Notas Internas)
CREATE TABLE IF NOT EXISTS \`ticket_messages\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`ticket_id\` VARCHAR(20) NOT NULL,
    \`sender_name\` VARCHAR(100) NOT NULL,
    \`sender_role\` ENUM('customer', 'agent', 'admin') DEFAULT 'agent',
    \`message_type\` ENUM('public_reply', 'internal_note') DEFAULT 'public_reply',
    \`content\` TEXT NOT NULL,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT \`fk_messages_ticket\` FOREIGN KEY (\`ticket_id\`) REFERENCES \`tickets\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Auditoría y Actividades
CREATE TABLE IF NOT EXISTS \`ticket_activities\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`ticket_id\` VARCHAR(20) NOT NULL,
    \`activity_type\` VARCHAR(50) NOT NULL,
    \`actor\` VARCHAR(100) NOT NULL,
    \`description\` VARCHAR(255) NOT NULL,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT \`fk_activities_ticket\` FOREIGN KEY (\`ticket_id\`) REFERENCES \`tickets\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data
INSERT INTO \`agents\` (\`id\`, \`name\`, \`email\`, \`role\`, \`department\`, \`status\`) VALUES
(1, 'Elena Gómez', 'elena.gomez@empresa.com', 'Especialista N2 Soporte', 'Soporte TI', 'available'),
(2, 'Carlos Mendoza', 'carlos.mendoza@empresa.com', 'Lead de Infraestructura', 'Infraestructura', 'busy');

INSERT INTO \`tickets\` (\`id\`, \`title\`, \`description\`, \`status\`, \`priority\`, \`category\`, \`department\`, \`requester_name\`, \`requester_email\`, \`assignee_id\`, \`sla_due_at\`) VALUES
('TCK-1048', 'Error de conexión VPN en sede Valencia', 'Timeout en túnel IPSec tras reinicio.', 'open', 'urgent', 'network', 'Infraestructura', 'Laura Sánchez', 'laura@empresa.com', 2, DATE_ADD(NOW(), INTERVAL 4 HOUR)),
('TCK-1045', 'Aprovisionamiento SSO y Google Workspace', 'Alta nuevo empleado en analítica.', 'in_progress', 'medium', 'access', 'Soporte TI', 'Fernando Ruiz', 'fernando@empresa.com', 1, DATE_ADD(NOW(), INTERVAL 24 HOUR));`,
    },
    {
      name: 'README.md',
      path: 'README.md',
      language: 'markdown',
      category: 'Documentación',
      content: `# TicketDesk Pro - Sistema de Gestión de Tickets en PHP & MySQL

## Instrucciones de Instalación:
1. Importar database.sql en phpMyAdmin o consola MySQL:
   \`mysql -u root -p < database.sql\`
2. Configurar credenciales en config/database.php.
3. Ejecutar servidor PHP:
   \`php -S localhost:8000\`
4. Abrir http://localhost:8000 en tu navegador.`,
    },
  ];

  const currentFile = phpFiles[selectedFileIndex];

  const handleCopy = (content: string, name: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(name);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      phpFiles.forEach((file) => {
        zip.file(file.path, file.content);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ticketdesk-php-mysql.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSql = () => {
    const sqlFile = phpFiles.find((f) => f.name === 'database.sql');
    if (!sqlFile) return;
    const blob = new Blob([sqlFile.content], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ticketdesk-database.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Banner with Download Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                Arquitectura PHP 8.2 & MySQL
              </span>
              <span className="text-xs text-slate-400">· PDO Seguro & Tailwind</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Código Fuente del Sistema Convertido a PHP
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              El sistema ha sido estructurado en PHP modular con clases POO, conexión PDO resistente a inyección SQL, API REST para tickets y métricas SLA, script SQL completo y controlador de vistas con tablero Kanban.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadSql}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Descargar database.sql</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'Comprimiendo...' : 'Descargar Proyecto Completo (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Setup Commands bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-xs space-y-2">
        <div className="flex items-center justify-between font-bold text-slate-700 text-[11px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-indigo-600" />
            Cómo ejecutarlo en tu servidor local (XAMPP / LAMP / Docker / PHP CLI):
          </span>
          <span className="text-emerald-600 font-semibold">Listo para Producción</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
          <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg">
            <span className="text-slate-500 block text-[10px]">1. Importar base de datos</span>
            mysql -u root -p &lt; database.sql
          </div>
          <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg">
            <span className="text-slate-500 block text-[10px]">2. Configurar credenciales</span>
            nano config/database.php
          </div>
          <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg">
            <span className="text-slate-500 block text-[10px]">3. Servidor de prueba</span>
            php -S localhost:8000
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Files List (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-indigo-500" />
              Archivos del Proyecto ({phpFiles.length})
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {phpFiles.map((file, idx) => {
              const isSelected = selectedFileIndex === idx;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left p-3 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 text-indigo-950 font-semibold border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-mono text-xs truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{file.category}</div>
                  </div>
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer & Actions (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          {/* File Toolbar */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span className="font-mono text-xs font-bold text-slate-100 truncate">
                {currentFile.path}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans">
                {currentFile.category}
              </span>
            </div>

            <button
              onClick={() => handleCopy(currentFile.content, currentFile.name)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFile === currentFile.name ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar código</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer pre/code block */}
          <div className="p-4 bg-slate-950 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="font-mono text-xs text-slate-200 leading-relaxed">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
