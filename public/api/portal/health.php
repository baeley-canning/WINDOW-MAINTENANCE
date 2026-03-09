<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$dbOk = false;
$error = '';

try {
    portal_db();
    $dbOk = true;
} catch (Throwable $e) {
    $dbOk = false;
    $error = $e->getMessage();
}

json_response([
    'ok' => $dbOk,
    'db' => $dbOk,
    'authenticated' => portal_is_authenticated(),
    'error' => $dbOk ? '' : $error,
]);
