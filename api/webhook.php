<?php
header('Content-Type: application/json');

// Webhook receiver for Lynkko form submissions
// Lynkko sends POST with contact data → we store it in contacts.json

$contacts_file = __DIR__ . '/../data/contacts.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Also support form-encoded (some webhook formats)
    if (!$data) {
        $data = $_POST;
    }
    
    if (empty($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'No data received']);
        exit;
    }
    
    // Build contact record
    $contact = [
        'id' => uniqid('ct_', true),
        'name' => $data['name'] ?? $data['nombre'] ?? '',
        'email' => $data['email'] ?? $data['correo'] ?? '',
        'company' => $data['company'] ?? $data['empresa'] ?? '',
        'phone' => $data['phone'] ?? $data['telefono'] ?? '',
        'message' => $data['message'] ?? $data['mensaje'] ?? '',
        'source' => 'lynkko_form',
        'status' => 'nuevo',
        'tags' => [],
        'notes' => '',
        'created_at' => date('c'),
        'updated_at' => date('c')
    ];
    
    // Load existing contacts
    $contacts = [];
    if (file_exists($contacts_file)) {
        $existing = file_get_contents($contacts_file);
        $contacts = json_decode($existing, true) ?: [];
    }
    
    // Check for duplicate email
    foreach ($contacts as &$c) {
        if (strtolower($c['email']) === strtolower($contact['email']) && !empty($contact['email'])) {
            $c['status'] = 'recontacto';
            $c['updated_at'] = date('c');
            $c['message'] = $contact['message'] ?: $c['message'];
            file_put_contents($contacts_file, json_encode($contacts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            echo json_encode(['ok' => true, 'id' => $c['id'], 'status' => 'recontacto']);
            exit;
        }
    }
    
    $contacts[] = $contact;
    
    // Ensure data directory exists
    @mkdir(dirname($contacts_file), 0755, true);
    
    $result = file_put_contents($contacts_file, json_encode($contacts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save contact']);
        exit;
    }
    
    echo json_encode(['ok' => true, 'id' => $contact['id'], 'status' => 'nuevo']);
    exit;
}

// GET: return contacts (with auth)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $token = $_GET['token'] ?? $_SERVER['HTTP_X_CMS_TOKEN'] ?? '';
    $secret = trim(@file_get_contents(__DIR__ . '/../cms.secret') ?: 'dev2026');
    
    if ($token !== $secret) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    if (file_exists($contacts_file)) {
        echo file_get_contents($contacts_file);
    } else {
        echo json_encode([]);
    }
    exit;
}

// PATCH: update contact status/tags
if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $token = $_GET['token'] ?? $_SERVER['HTTP_X_CMS_TOKEN'] ?? '';
    $secret = trim(@file_get_contents(__DIR__ . '/../cms.secret') ?: 'dev2026');
    
    if ($token !== $secret) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Contact ID required']);
        exit;
    }
    
    $contacts = [];
    if (file_exists($contacts_file)) {
        $contacts = json_decode(file_get_contents($contacts_file), true) ?: [];
    }
    
    foreach ($contacts as &$c) {
        if ($c['id'] === $data['id']) {
            if (isset($data['status'])) $c['status'] = $data['status'];
            if (isset($data['tags'])) $c['tags'] = $data['tags'];
            if (isset($data['notes'])) $c['notes'] = $data['notes'];
            $c['updated_at'] = date('c');
            file_put_contents($contacts_file, json_encode($contacts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            echo json_encode(['ok' => true, 'contact' => $c]);
            exit;
        }
    }
    
    http_response_code(404);
    echo json_encode(['error' => 'Contact not found']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
