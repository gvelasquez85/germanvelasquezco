<?php
header('Content-Type: application/json');

// Simple file-based CMS API
// POST: save content.json
// GET: read content.json

$file = __DIR__ . '/../content.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'content.json not found']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Simple auth via query param or header
    $token = $_GET['token'] ?? $_SERVER['HTTP_X_CMS_TOKEN'] ?? '';
    $secret = trim(@file_get_contents(__DIR__ . '/../cms.secret') ?: 'dev2026');
    
    if ($token !== $secret) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    // Validate it's a proper structure (has hero key at minimum)
    if (!isset($data['hero'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid content structure']);
        exit;
    }

    $result = file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to write file']);
        exit;
    }

    echo json_encode(['ok' => true, 'bytes' => $result]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
