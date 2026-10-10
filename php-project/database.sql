-- ========================================================
-- TicketDesk Pro - Base de Datos MySQL / MariaDB
-- Sistema de Gestión de Tickets de Soporte & Helpdesk
-- ========================================================

CREATE DATABASE IF NOT EXISTS `ticketdesk_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ticketdesk_db`;

-- 1. Tabla de Agentes Técnicos
CREATE TABLE IF NOT EXISTS `agents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `avatar` VARCHAR(255) DEFAULT NULL,
    `role` VARCHAR(80) NOT NULL DEFAULT 'Técnico de Soporte',
    `department` VARCHAR(60) NOT NULL DEFAULT 'Soporte TI',
    `status` ENUM('available', 'busy', 'away') DEFAULT 'available',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla Principal de Tickets
CREATE TABLE IF NOT EXISTS `tickets` (
    `id` VARCHAR(20) PRIMARY KEY, -- Ej: TCK-1048
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('open', 'in_progress', 'waiting_client', 'resolved', 'closed') DEFAULT 'open',
    `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    `category` VARCHAR(50) NOT NULL DEFAULT 'software',
    `department` VARCHAR(60) NOT NULL DEFAULT 'Soporte TI',
    `requester_name` VARCHAR(100) NOT NULL,
    `requester_email` VARCHAR(120) NOT NULL,
    `requester_company` VARCHAR(120) DEFAULT NULL,
    `requester_phone` VARCHAR(40) DEFAULT NULL,
    `assignee_id` INT DEFAULT NULL,
    `sla_due_at` DATETIME NOT NULL,
    `first_response_due_at` DATETIME DEFAULT NULL,
    `time_spent_minutes` INT DEFAULT 0,
    `tags` VARCHAR(255) DEFAULT '',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_status` (`status`),
    INDEX `idx_priority` (`priority`),
    INDEX `idx_department` (`department`),
    INDEX `idx_sla` (`sla_due_at`),
    CONSTRAINT `fk_tickets_assignee` FOREIGN KEY (`assignee_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Mensajes e Hilo de Conversación
CREATE TABLE IF NOT EXISTS `ticket_messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ticket_id` VARCHAR(20) NOT NULL,
    `sender_name` VARCHAR(100) NOT NULL,
    `sender_role` ENUM('customer', 'agent', 'admin') DEFAULT 'agent',
    `message_type` ENUM('public_reply', 'internal_note') DEFAULT 'public_reply',
    `content` TEXT NOT NULL,
    `attachments_json` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_ticket_msg` (`ticket_id`),
    CONSTRAINT `fk_messages_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Auditoría / Historial de Actividades
CREATE TABLE IF NOT EXISTS `ticket_activities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ticket_id` VARCHAR(20) NOT NULL,
    `activity_type` VARCHAR(50) NOT NULL, -- status_change, priority_change, assigned, note_added, time_logged
    `actor` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_ticket_act` (`ticket_id`),
    CONSTRAINT `fk_activities_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de Artículos de la Base de Conocimiento (Knowledge Base)
CREATE TABLE IF NOT EXISTS `knowledge_articles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(80) NOT NULL,
    `summary` TEXT NOT NULL,
    `content` MEDIUMTEXT NOT NULL,
    `tags` VARCHAR(255) DEFAULT '',
    `helpful_count` INT DEFAULT 0,
    `author` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FULLTEXT `idx_search_kb` (`title`, `summary`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- DATOS INICIALES DE DEMOSTRACIÓN (SEED DATA)
-- ========================================================

INSERT INTO `agents` (`id`, `name`, `email`, `avatar`, `role`, `department`, `status`) VALUES
(1, 'Elena Gómez', 'elena.gomez@empresa.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Especialista N2 Soporte', 'Soporte TI', 'available'),
(2, 'Carlos Mendoza', 'carlos.mendoza@empresa.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Lead de Infraestructura', 'Infraestructura', 'busy'),
(3, 'Valeria Restrepo', 'valeria.restrepo@empresa.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Analista de Ciberseguridad', 'Ciberseguridad', 'available'),
(4, 'Mateo Morales', 'mateo.morales@empresa.com', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Especialista en Facturación', 'Facturación', 'away');

INSERT INTO `tickets` (`id`, `title`, `description`, `status`, `priority`, `category`, `department`, `requester_name`, `requester_email`, `requester_company`, `assignee_id`, `sla_due_at`, `time_spent_minutes`, `tags`) VALUES
('TCK-1048', 'Error de conexión VPN en oficina remota de Valencia', 'Varios empleados no pueden conectarse al túnel IPSec desde las 08:30 AM tras el reinicio programado del firewall.', 'open', 'urgent', 'network', 'Infraestructura', 'Laura Sánchez', 'laura.sanchez@innovatech.com', 'InnovaTech Hub', 2, DATE_ADD(NOW(), INTERVAL 4 HOUR), 45, 'VPN, Red, Urgente'),
('TCK-1045', 'Solicitud de aprovisionamiento de permisos SSO y Google Workspace', 'Nuevo ingreso para el área de Analítica. Requiere cuenta en Google Workspace, acceso a BigQuery y licencia Tableau.', 'in_progress', 'medium', 'access', 'Soporte TI', 'Fernando Ruiz', 'fernando.ruiz@innovatech.com', 'InnovaTech Hub', 1, DATE_ADD(NOW(), INTERVAL 24 HOUR), 30, 'Onboarding, SSO, Google'),
('TCK-1044', 'Discrepancia en factura mensual #INV-2026-092 y recargo indebido', 'La factura recibida incluye un cobro por licencias ya desprovisionadas el pasado mes.', 'waiting_client', 'high', 'billing', 'Facturación', 'Beatriz Navarro', 'beatriz.navarro@globalcorp.es', 'GlobalCorp Logistics', 4, DATE_ADD(NOW(), INTERVAL 8 HOUR), 60, 'Factura, Finanzas'),
('TCK-1042', 'Pantalla azul recurrente (BSOD) en portátil Lenovo ThinkPad', 'El equipo sufre reinicios espontáneos con código CRITICAL_PROCESS_DIED.', 'in_progress', 'urgent', 'hardware', 'Soporte TI', 'Guillermo Alarcón', 'guillermo.alarcon@innovatech.com', 'InnovaTech Hub', 1, DATE_ADD(NOW(), INTERVAL 2 HOUR), 90, 'Hardware, Windows, VIP'),
('TCK-1039', 'Alerta de intentos masivos de fuerza bruta en SSH', 'Detección de más de 4,500 intentos de login fallidos desde IP externa.', 'resolved', 'high', 'incident', 'Ciberseguridad', 'SIEM Alerter', 'alerts-siem@empresa.com', 'Monitor Automático', 3, DATE_SUB(NOW(), INTERVAL 1 DAY), 75, 'Seguridad, SSH, WAF');

INSERT INTO `ticket_messages` (`ticket_id`, `sender_name`, `sender_role`, `message_type`, `content`) VALUES
('TCK-1048', 'Laura Sánchez', 'customer', 'public_reply', 'Hola equipo, ninguno de los 12 consultores en la sede de Valencia puede acceder al CRM ni a bases internas por fallo VPN.'),
('TCK-1048', 'Carlos Mendoza', 'agent', 'internal_note', 'Revisando logs de Fortinet. La regla NAT perdió la ruta estática tras el firmware update.'),
('TCK-1048', 'Carlos Mendoza', 'agent', 'public_reply', 'Hola Laura, estamos aplicando un parche de enrutamiento al concentrador principal. Esperamos restaurar el tráfico en 30 min.');

INSERT INTO `knowledge_articles` (`title`, `category`, `summary`, `content`, `tags`, `helpful_count`, `author`) VALUES
('Guía rápida de conexión a la VPN corporativa (Windows y macOS)', 'Redes y Conectividad', 'Pasos para instalar el cliente OpenVPN / FortiClient y autenticar con 2FA.', 'Descargue el instalador desde vpn.empresa.com y utilice sus credenciales con autenticación de doble factor.', 'VPN, Red, Windows, Mac', 42, 'Carlos Mendoza'),
('Cómo solicitar licencias de software y accesos', 'Cuentas y Accesos', 'Protocolo para autorizaciones de Figma, Copilot y Adobe Cloud.', 'Abra un ticket bajo la categoría Acceso / Software indicando centro de costes del proyecto.', 'Licencias, Software', 29, 'Elena Gómez'),
('Protocolo ante sospecha de phishing', 'Ciberseguridad', 'Qué hacer si recibe un correo sospechoso solicitando claves.', 'No descargue adjuntos, use el botón Reportar Phishing y avise al equipo de TI.', 'Seguridad, Phishing, Urgente', 65, 'Valeria Restrepo');
