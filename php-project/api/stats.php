<?php
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
}
