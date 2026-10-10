<?php
/**
 * TicketDesk Pro - Configuración de Base de Datos
 * Conexión segura mediante PDO (PHP Data Objects)
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
            // Permitir sobreescribir mediante variables de entorno
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
}
