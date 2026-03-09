<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

json_response([
    'ok' => true,
    'authenticated' => portal_is_authenticated(),
    'user' => portal_is_authenticated() ? (string)($_SESSION['portal_user'] ?? '') : '',
]);
