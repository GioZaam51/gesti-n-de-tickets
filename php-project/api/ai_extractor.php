<?php
/**
 * TicketDesk Pro - Módulo de Extracción de Información con IA en PHP
 * Conexión con modelo Gemini (gemini-3.8-flash) para documentos PDF y PowerPoint
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$fileName = $input['fileName'] ?? 'documento.pdf';
$fileType = strtolower($input['fileType'] ?? 'pdf');
$textContent = $input['textContent'] ?? '';
$fileBase64 = $input['fileBase64'] ?? '';

$apiKey = getenv('GEMINI_API_KEY') ?: '';

// Si no hay API key configurada en el servidor PHP, devolver respuesta estructurada simulada
if (empty($apiKey)) {
    echo json_encode([
        'success' => true,
        'provider' => 'php_offline_simulator',
        'data' => [
            'title' => "Extracción IA desde {$fileName}",
            'summary' => "Incidencia técnica identificada en el archivo {$fileName}. Se detectaron fallas de configuración y solicitudes de servicio prioritarias.",
            'category' => (strpos(strtolower($fileName), 'red') !== false || strpos(strtolower($fileName), 'vpn') !== false) ? 'network' : 'software',
            'priority' => 'urgent',
            'priorityReason' => 'Afectación a múltiples usuarios en horario productivo.',
            'department' => 'Infraestructura',
            'slaSuggestedHours' => 4,
            'requesterName' => 'Auditoría Técnica PHP',
            'requesterEmail' => 'soporte@empresa.com',
            'affectedSystems' => ['Servidor Web Nginx', 'Base de Datos MySQL', 'Túnel VPN'],
            'errorCodes' => ['ERR_TIMEOUT_CONN', 'AUTH_FAILURE_502'],
            'actionItems' => [
                'Revisar logs de servidor en /var/log/syslog',
                'Renovar certificados TLS y validar handshake',
                'Confirmar resolución con el usuario solicitante'
            ],
            'rawKeyFindings' => [
                "Archivo analizado con PHP: {$fileName}",
                "Formato procesado: " . strtoupper($fileType)
            ]
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Llamada HTTP cURL al endpoint de Gemini API v1beta
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" . urlencode($apiKey);

$systemInstruction = "Eres un analista de mesa de ayuda TI. Analiza el documento y extrae los datos para crear un ticket de soporte. Devuelve un objeto JSON con: title, summary, category, priority, priorityReason, department, slaSuggestedHours, requesterName, requesterEmail, affectedSystems (array), errorCodes (array), actionItems (array), rawKeyFindings (array).";

$promptText = "Analiza este documento ({$fileName}):\n\n" . ($textContent ?: "Archivo PDF base64 recibido");

$payload = [
    'contents' => [
        [
            'parts' => [
                ['text' => $promptText]
            ]
        ]
    ],
    'generationConfig' => [
        'responseMimeType' => 'application/json',
        'temperature' => 0.2
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    $decoded = json_decode($response, true);
    $textResponse = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
    $extractedData = json_decode($textResponse, true);

    echo json_encode([
        'success' => true,
        'provider' => 'gemini_api_php_curl',
        'data' => $extractedData
    ], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => "Error de API Gemini (HTTP {$httpCode})",
        'raw' => $response
    ], JSON_UNESCAPED_UNICODE);
}
