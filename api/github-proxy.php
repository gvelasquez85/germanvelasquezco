<?php
// GitHub API Proxy — avoids CORS issues from browser
// Usage: api/github-proxy.php?path=users/gvelasquez85/repos

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$path = $_GET['path'] ?? 'users/gvelasquez85/repos';

// Validate path (prevent SSRF)
if (!preg_match('/^[a-zA-Z0-9\/\-_?&=.]+$/', $path)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid path']);
    exit;
}

$url = 'https://api.github.com/' . $path;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'germanvelasquez.co');
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

http_response_code($http_code);
echo $response;
