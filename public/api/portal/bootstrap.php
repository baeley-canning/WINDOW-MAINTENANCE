<?php
declare(strict_types=1);

if (basename(__FILE__) === basename((string)($_SERVER['SCRIPT_FILENAME'] ?? ''))) {
    http_response_code(403);
    exit('Forbidden');
}

date_default_timezone_set('Pacific/Auckland');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

require_once __DIR__ . '/config.php';

$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_name('wm_portal_session');
session_set_cookie_params([
    'lifetime' => (int)WM_PORTAL_SESSION_DAYS * 86400,
    'path' => '/',
    'domain' => '',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Lax',
]);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function require_method(string $method): void
{
    if (strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== strtoupper($method)) {
        json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
    }
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_response(['ok' => false, 'error' => 'Invalid JSON body'], 400);
    }
    return $data;
}

function portal_is_authenticated(): bool
{
    return isset($_SESSION['portal_auth']) && $_SESSION['portal_auth'] === 1;
}

function portal_require_auth(): void
{
    if (!portal_is_authenticated()) {
        json_response(['ok' => false, 'error' => 'Unauthorized'], 401);
    }
}

function portal_db(): mysqli
{
    static $db = null;

    if ($db instanceof mysqli) {
        return $db;
    }

    $required = [
        'WM_PORTAL_DB_HOST' => WM_PORTAL_DB_HOST,
        'WM_PORTAL_DB_NAME' => WM_PORTAL_DB_NAME,
        'WM_PORTAL_DB_USER' => WM_PORTAL_DB_USER,
        'WM_PORTAL_DB_PASS' => WM_PORTAL_DB_PASS,
    ];

    foreach ($required as $key => $value) {
        if ($value === '' || str_starts_with($value, 'CHANGE_ME_')) {
            json_response([
                'ok' => false,
                'error' => 'Portal database is not configured. Update public/api/portal/config.php',
                'missing' => $key,
            ], 500);
        }
    }

    mysqli_report(MYSQLI_REPORT_OFF);
    $db = @new mysqli(WM_PORTAL_DB_HOST, WM_PORTAL_DB_USER, WM_PORTAL_DB_PASS, WM_PORTAL_DB_NAME);
    if ($db->connect_errno) {
        json_response([
            'ok' => false,
            'error' => 'Database connection failed',
            'details' => $db->connect_error,
        ], 500);
    }

    $db->set_charset('utf8mb4');
    portal_ensure_schema($db);

    return $db;
}

function portal_ensure_schema(mysqli $db): void
{
    $sql = <<<SQL
CREATE TABLE IF NOT EXISTS portal_jobs (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  job_date DATE NOT NULL,
  job_time TIME NOT NULL,
  customer_name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  address VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  status ENUM('Booked','In progress','Done') NOT NULL DEFAULT 'Booked',
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_job_date (job_date),
  KEY idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL;

    if (!$db->query($sql)) {
        json_response([
            'ok' => false,
            'error' => 'Failed to prepare portal_jobs table',
            'details' => $db->error,
        ], 500);
    }

    // Backward-compatible schema updates for map/geocode support.
    if (
        !$db->query("ALTER TABLE portal_jobs ADD COLUMN lat DECIMAL(10,7) NULL AFTER address")
        && (int)$db->errno !== 1060
    ) {
        json_response([
            'ok' => false,
            'error' => 'Failed to add portal_jobs.lat column',
            'details' => $db->error,
        ], 500);
    }

    if (
        !$db->query("ALTER TABLE portal_jobs ADD COLUMN lng DECIMAL(10,7) NULL AFTER lat")
        && (int)$db->errno !== 1060
    ) {
        json_response([
            'ok' => false,
            'error' => 'Failed to add portal_jobs.lng column',
            'details' => $db->error,
        ], 500);
    }

    $geoSql = <<<SQL
CREATE TABLE IF NOT EXISTS portal_geocode_cache (
  query_hash CHAR(40) NOT NULL PRIMARY KEY,
  query_text VARCHAR(255) NOT NULL,
  label VARCHAR(255) NOT NULL,
  lat DECIMAL(10,7) NULL,
  lng DECIMAL(10,7) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL;

    if (!$db->query($geoSql)) {
        json_response([
            'ok' => false,
            'error' => 'Failed to prepare portal_geocode_cache table',
            'details' => $db->error,
        ], 500);
    }
}

function portal_normalize_status(string $status): string
{
    $valid = ['Booked', 'In progress', 'Done'];
    return in_array($status, $valid, true) ? $status : 'Booked';
}

function portal_is_valid_date(string $date): bool
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        return false;
    }
    $dt = DateTime::createFromFormat('Y-m-d', $date);
    return $dt instanceof DateTime && $dt->format('Y-m-d') === $date;
}

function portal_is_valid_time(string $time): bool
{
    if (!preg_match('/^\d{2}:\d{2}$/', $time)) {
        return false;
    }
    [$h, $m] = array_map('intval', explode(':', $time));
    return $h >= 0 && $h <= 23 && $m >= 0 && $m <= 59;
}

function portal_job_from_row(array $row): array
{
    $lat = isset($row['lat']) && $row['lat'] !== null ? (float)$row['lat'] : null;
    $lng = isset($row['lng']) && $row['lng'] !== null ? (float)$row['lng'] : null;

    return [
        'id' => (string)$row['id'],
        'date' => (string)$row['job_date'],
        'time' => substr((string)$row['job_time'], 0, 5),
        'customer' => (string)$row['customer_name'],
        'phone' => (string)$row['phone'],
        'address' => (string)$row['address'],
        'lat' => $lat,
        'lng' => $lng,
        'summary' => (string)$row['summary'],
        'status' => (string)$row['status'],
        'deleted' => ((int)$row['is_deleted']) === 1,
        'updatedAt' => (string)$row['updated_at'],
    ];
}

function portal_parse_coord(mixed $value, float $min, float $max): ?float
{
    if ($value === null) {
        return null;
    }
    if (is_string($value) && trim($value) === '') {
        return null;
    }
    if (!is_numeric($value)) {
        return null;
    }

    $coord = (float)$value;
    if ($coord < $min || $coord > $max) {
        return null;
    }
    return round($coord, 7);
}

function portal_http_get_json(string $url): ?array
{
    $userAgent = 'WindowMaintenancePortal/1.0 (+https://windowmaintenance.co.nz)';

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        if ($ch === false) {
            return null;
        }
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_USERAGENT => $userAgent,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
        ]);
        $raw = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
        if (!is_string($raw) || $code < 200 || $code >= 300) {
            return null;
        }
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : null;
    }

    $context = stream_context_create([
        'http' => [
            'timeout' => 8,
            'header' => "Accept: application/json\r\nUser-Agent: " . $userAgent . "\r\n",
        ],
    ]);
    $raw = @file_get_contents($url, false, $context);
    if (!is_string($raw) || trim($raw) === '') {
        return null;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : null;
}

function portal_geocode_search_nz(mysqli $db, string $query, int $limit = 6, bool $cacheFirst = false): array
{
    $query = trim($query);
    if ($query === '') {
        return [];
    }

    $queryHash = sha1(strtolower($query));
    if ($cacheFirst) {
        $stmt = $db->prepare("SELECT label, lat, lng FROM portal_geocode_cache WHERE query_hash = ? LIMIT 1");
        if ($stmt) {
            $stmt->bind_param('s', $queryHash);
            $stmt->execute();
            $stmt->bind_result($label, $lat, $lng);
            if ($stmt->fetch()) {
                $stmt->close();
                return [[
                    'label' => (string)$label,
                    'lat' => (float)$lat,
                    'lng' => (float)$lng,
                ]];
            }
            $stmt->close();
        }
    }

    $q = $query;
    if (stripos($q, 'new zealand') === false) {
        $q .= ', New Zealand';
    }
    $url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=0&countrycodes=nz&limit='
        . max(1, min(10, $limit)) . '&q=' . rawurlencode($q);

    $rows = portal_http_get_json($url);
    if (!is_array($rows)) {
        return [];
    }

    $results = [];
    foreach ($rows as $row) {
        if (!is_array($row)) {
            continue;
        }
        $lat = portal_parse_coord($row['lat'] ?? null, -90.0, 90.0);
        $lng = portal_parse_coord($row['lon'] ?? null, -180.0, 180.0);
        $label = trim((string)($row['display_name'] ?? ''));
        if ($lat === null || $lng === null || $label === '') {
            continue;
        }
        $results[] = [
            'label' => $label,
            'lat' => $lat,
            'lng' => $lng,
        ];
    }

    if (!empty($results) && $cacheFirst) {
        $top = $results[0];
        $latStr = number_format((float)$top['lat'], 7, '.', '');
        $lngStr = number_format((float)$top['lng'], 7, '.', '');
        $stmt = $db->prepare(
            "INSERT INTO portal_geocode_cache (query_hash, query_text, label, lat, lng, updated_at)
             VALUES (?, ?, ?, NULLIF(?, ''), NULLIF(?, ''), NOW())
             ON DUPLICATE KEY UPDATE
               query_text = VALUES(query_text),
               label = VALUES(label),
               lat = VALUES(lat),
               lng = VALUES(lng),
               updated_at = NOW()"
        );
        if ($stmt) {
            $stmt->bind_param('sssss', $queryHash, $query, $top['label'], $latStr, $lngStr);
            $stmt->execute();
            $stmt->close();
        }
    }

    return $results;
}
