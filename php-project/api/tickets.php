<?php
/**
 * TicketDesk Pro - API REST de Tickets (PHP)
 * Endpoint JSON para operaciones CRUD y flujo de estados
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
                $filters = [
                    'status' => $_GET['status'] ?? 'all',
                    'priority' => $_GET['priority'] ?? 'all',
                    'department' => $_GET['department'] ?? 'all',
                    'search' => $_GET['search'] ?? '',
                    'sortBy' => $_GET['sortBy'] ?? 'newest',
                ];
                $list = $ticketModel->getAll($filters);
                echo json_encode(['success' => true, 'count' => count($list), 'data' => $list], JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

            if (isset($_GET['action']) && $_GET['action'] === 'message') {
                if (empty($input['ticket_id']) || empty($input['content'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'ticket_id y content son requeridos']);
                    exit;
                }
                $msgId = $ticketModel->addMessage(
                    $input['ticket_id'],
                    $input['sender_name'] ?? 'Agente de Soporte',
                    $input['sender_role'] ?? 'agent',
                    $input['message_type'] ?? 'public_reply',
                    $input['content']
                );
                echo json_encode(['success' => true, 'message_id' => $msgId]);
                exit;
            }

            // Crear nuevo ticket
            if (empty($input['title']) || empty($input['description']) || empty($input['requester_name'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Campos obligatorios faltantes']);
                exit;
            }

            $newId = $ticketModel->create($input);
            http_response_code(201);
            echo json_encode(['success' => true, 'ticket_id' => $newId, 'message' => 'Ticket registrado correctamente']);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            if (empty($input['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID de ticket requerido']);
                exit;
            }

            if (isset($input['status'])) {
                $ticketModel->updateStatus($input['id'], $input['status'], $input['actor'] ?? 'Agente');
            }
            if (isset($input['assignee_id'])) {
                $ticketModel->assign($input['id'], $input['assignee_id'] ? (int)$input['assignee_id'] : null, $input['actor'] ?? 'Agente');
            }
            if (isset($input['log_minutes'])) {
                $ticketModel->logTime($input['id'], (int)$input['log_minutes'], $input['actor'] ?? 'Agente');
            }

            echo json_encode(['success' => true, 'message' => 'Ticket actualizado con éxito']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Método no permitido']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
