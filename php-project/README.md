# TicketDesk Pro - Sistema de Gestión de Tickets en PHP & MySQL

Sistema completo de Helpdesk, Mesa de Ayuda y Gestión de Tickets programado en **PHP 8.2+**, **PDO** y **MySQL/MariaDB**, con interfaz moderna en **Tailwind CSS**.

---

## 📁 Estructura del Proyecto PHP

```text
php-project/
├── config/
│   └── database.php         # Conexión Singleton con PDO (segura, UTF-8, variables de entorno)
├── models/
│   ├── Ticket.php           # Lógica de negocio de Tickets, cálculo de SLA, auditoría y métricas
│   └── Agent.php            # Gestión de técnicos de soporte y carga de trabajo
├── api/
│   ├── tickets.php          # API REST (GET, POST, PUT, DELETE) con soporte JSON
│   └── stats.php            # Endpoint de métricas, cumplimiento de SLA y MTTR
├── database.sql             # Script SQL de creación de tablas, índices y datos iniciales
├── index.php                # Aplicación web completa y tablero Kanban en PHP
└── README.md                # Guía de instalación y despliegue
```

---

## 🚀 Requisitos Previos

- **PHP 8.0 o superior** con extensiones `pdo` y `pdo_mysql` habilitadas.
- **MySQL 5.7+** o **MariaDB 10.3+**.
- Servidor web: **Apache**, **Nginx** o el servidor embebido de PHP.

---

## 🛠️ Instalación Rápida Paso a Paso

### Paso 1: Importar la Base de Datos

En tu gestor de base de datos favorito (phpMyAdmin, MySQL Workbench, DBeaver o consola):

```bash
mysql -u root -p < database.sql
```

Esto creará la base de datos `ticketdesk_db` con las tablas:
- `tickets`
- `agents`
- `ticket_messages` (hilo con respuestas públicas y notas internas)
- `ticket_activities` (registro de auditoría de cambios)
- `knowledge_articles` (base de conocimiento)

### Paso 2: Configurar Credenciales

Edita el archivo `config/database.php` o define las variables de entorno en tu servidor:

```php
private static string $host = '127.0.0.1';
private static string $dbName = 'ticketdesk_db';
private static string $user = 'root';
private static string $pass = ''; // Tu contraseña de MySQL
```

### Paso 3: Iniciar el Servidor PHP

Puedes usar cualquier entorno (XAMPP/WAMP copiando la carpeta a `htdocs/`) o ejecutar directamente el servidor de desarrollo de PHP:

```bash
cd php-project
php -S localhost:8000
```

Abre tu navegador en:
👉 `http://localhost:8000`

---

## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/tickets.php` | Listar todos los tickets (acepta `?status=`, `?priority=`, `?search=`) |
| `GET` | `/api/tickets.php?id=TCK-1048` | Obtener detalle con mensajes y auditoría |
| `POST` | `/api/tickets.php` | Crear un nuevo ticket (calcula SLA automáticamente) |
| `POST` | `/api/tickets.php?action=message` | Agregar respuesta pública o nota interna privada |
| `PUT` | `/api/tickets.php` | Actualizar estado, reasignar técnico o registrar minutos |
| `GET` | `/api/stats.php` | Obtener métricas de cumplimiento de SLA y volumen |

---

## 💡 Características Implementadas

- **Tablero Kanban con PHP**: Agrupación automática por estados (`open`, `in_progress`, `waiting_client`, `resolved`, `closed`).
- **Cálculo de SLA**: Basado en prioridad (Urgente = 4h, Alta = 8h, Media = 24h, Baja = 48h).
- **Notas Internas**: Soporte para comentarios privados solo entre agentes.
- **Registro de Tiempo**: Medición de minutos dedicados a la resolución.
- **Auditoría Transaccional**: Registro histórico de cada cambio de estado y asignación.
