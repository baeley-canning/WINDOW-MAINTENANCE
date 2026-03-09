<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_method('POST');

$body = read_json_body();
$username = trim((string)($body['username'] ?? ''));
$password = (string)($body['password'] ?? '');

if ($username === '' || $password === '') {
    json_response(['ok' => false, 'error' => 'Username and password are required'], 422);
}

$userOk = hash_equals((string)WM_PORTAL_APP_USER, $username);
$passOk = false;

if ((string)WM_PORTAL_APP_PASS_HASH !== '') {
    $passOk = password_verify($password, (string)WM_PORTAL_APP_PASS_HASH);
}

if (!$passOk && (string)WM_PORTAL_APP_PASS !== '') {
    $passOk = hash_equals((string)WM_PORTAL_APP_PASS, $password);
}

if (!$userOk || !$passOk) {
    json_response(['ok' => false, 'error' => 'Invalid username or password'], 401);
}

// Validate DB configuration/connection at login time for faster setup feedback.
portal_db();

session_regenerate_id(true);
$_SESSION['portal_auth'] = 1;
$_SESSION['portal_user'] = (string)WM_PORTAL_APP_USER;
$_SESSION['portal_login_at'] = time();

json_response([
    'ok' => true,
    'authenticated' => true,
    'user' => (string)WM_PORTAL_APP_USER,
]);
