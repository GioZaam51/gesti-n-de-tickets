<?php
/**
 * TicketDesk Pro - Sistema de Gestión de Tickets (PHP + MySQL + Tailwind)
 * Aplicación Web Completa en PHP
 */

require_once __DIR__ . '/models/Ticket.php';
require_once __DIR__ . '/models/Agent.php';

$ticketModel = new Ticket();
$agentModel = new Agent();

// Manejo de acciones POST tradicionales si se envían por formulario
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
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
</head>
<body class="min-h-full flex flex-col text-slate-800">

    <!-- Header PHP -->
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

                <div class="flex items-center gap-3">
                    <button onclick="document.getElementById('modal-new-ticket').classList.remove('hidden')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
                        <span>+ Nuevo Ticket</span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Container -->
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

        <!-- Kanban Board PHP -->
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

    <!-- Modal Nuevo Ticket PHP -->
    <div id="modal-new-ticket" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 class="font-bold text-sm text-slate-900">Registrar Ticket en PHP</h3>
                <button onclick="document.getElementById('modal-new-ticket').classList.add('hidden')" class="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form method="POST" action="index.php" class="space-y-3 text-xs">
                <input type="hidden" name="action" value="create_ticket">
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Título / Asunto</label>
                    <input type="text" name="title" required placeholder="Ej: Falla en enlace de fibra óptica" class="w-full px-3 py-2 border rounded-lg bg-slate-50">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-semibold text-slate-700 mb-1">Prioridad</label>
                        <select name="priority" class="w-full px-2.5 py-2 border rounded-lg bg-slate-50">
                            <option value="urgent">Urgente (SLA 4h)</option>
                            <option value="high">Alta (SLA 8h)</option>
                            <option value="medium" selected>Media (SLA 24h)</option>
                            <option value="low">Baja (SLA 48h)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 mb-1">Departamento</label>
                        <select name="department" class="w-full px-2.5 py-2 border rounded-lg bg-slate-50">
                            <option value="Soporte TI">Soporte TI</option>
                            <option value="Infraestructura">Infraestructura</option>
                            <option value="Ciberseguridad">Ciberseguridad</option>
                            <option value="Facturación">Facturación</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Descripción</label>
                    <textarea name="description" required rows="3" class="w-full px-3 py-2 border rounded-lg bg-slate-50" placeholder="Detalle técnico de la incidencia..."></textarea>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-semibold text-slate-700 mb-1">Nombre Solicitante</label>
                        <input type="text" name="requester_name" required value="Elena Gómez" class="w-full px-3 py-2 border rounded-lg bg-slate-50">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 mb-1">Email Solicitante</label>
                        <input type="email" name="requester_email" required value="elena@empresa.com" class="w-full px-3 py-2 border rounded-lg bg-slate-50">
                    </div>
                </div>
                <div class="pt-3 flex justify-end gap-2">
                    <button type="button" onclick="document.getElementById('modal-new-ticket').classList.add('hidden')" class="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">Cancelar</button>
                    <button type="submit" class="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg">Crear en MySQL</button>
                </div>
            </form>
        </div>
    </div>

</body>
</html>
