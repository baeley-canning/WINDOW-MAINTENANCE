<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
portal_require_auth();

if (strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'GET') {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

$db = portal_db();
$mode = strtolower(trim((string)($_GET['mode'] ?? 'suggest')));
$query = trim((string)($_GET['q'] ?? ''));

if ($query === '' || strlen($query) < 3) {
    json_response(['ok' => true, 'items' => []]);
}

if (strlen($query) > 255) {
    json_response(['ok' => false, 'error' => 'Query too long'], 422);
}

if ($mode === 'geocode') {
    $items = portal_geocode_search_nz($db, $query, 1, true);
    if (empty($items)) {
        json_response(['ok' => true, 'found' => false]);
    }
    json_response([
        'ok' => true,
        'found' => true,
        'item' => $items[0],
    ]);
}

$items = portal_geocode_search_nz($db, $query, 6, false);
json_response([
    'ok' => true,
    'items' => array_slice($items, 0, 6),
]);
