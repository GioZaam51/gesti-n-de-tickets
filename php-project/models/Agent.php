<?php
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

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM agents WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $agent = $stmt->fetch();
        return $agent ?: null;
    }
}
