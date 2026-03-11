<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
portal_require_auth();

$db = portal_db();
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));

if ($method === 'GET') {
    $jobs = [];
    $result = $db->query(
        "SELECT id, job_date, job_time, customer_name, phone, address, lat, lng, summary, status, is_unscheduled, is_deleted, updated_at
         FROM portal_jobs
         ORDER BY job_date ASC, job_time ASC, customer_name ASC"
    );
    if ($result === false) {
        json_response(['ok' => false, 'error' => 'Failed to load jobs', 'details' => $db->error], 500);
    }

    while ($row = $result->fetch_assoc()) {
        $jobs[] = portal_job_from_row($row);
    }
    $result->free();

    json_response(['ok' => true, 'jobs' => $jobs]);
}

if ($method !== 'POST') {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

$body = read_json_body();

if (isset($body['deleteId'])) {
    $deleteId = trim((string)$body['deleteId']);
    if ($deleteId === '' || strlen($deleteId) > 64) {
        json_response(['ok' => false, 'error' => 'Invalid job id'], 422);
    }

    $stmt = $db->prepare("UPDATE portal_jobs SET is_deleted = 1, updated_at = NOW() WHERE id = ?");
    if (!$stmt) {
        json_response(['ok' => false, 'error' => 'Failed to prepare delete query'], 500);
    }
    $stmt->bind_param('s', $deleteId);
    $stmt->execute();
    $stmt->close();

    json_response(['ok' => true]);
}

if (!isset($body['job']) || !is_array($body['job'])) {
    json_response(['ok' => false, 'error' => 'Missing job payload'], 422);
}

$job = $body['job'];

$id = trim((string)($job['id'] ?? ''));
$date = trim((string)($job['date'] ?? ''));
$time = trim((string)($job['time'] ?? ''));
$customer = trim((string)($job['customer'] ?? ''));
$phone = trim((string)($job['phone'] ?? ''));
$address = trim((string)($job['address'] ?? ''));
$lat = portal_parse_coord($job['lat'] ?? null, -90.0, 90.0);
$lng = portal_parse_coord($job['lng'] ?? null, -180.0, 180.0);
$summary = trim((string)($job['summary'] ?? ''));
$status = portal_normalize_status(trim((string)($job['status'] ?? 'Booked')));
$unscheduled = !empty($job['isUnscheduled']) ? 1 : 0;
$deleted = !empty($job['deleted']) ? 1 : 0;

if ($id === '') {
    $id = (string)round(microtime(true) * 1000) . '-' . substr(str_replace('.', '', uniqid('', true)), -6);
}

if (strlen($id) > 64) {
    json_response(['ok' => false, 'error' => 'Job id is too long'], 422);
}

if ($unscheduled === 1) {
    $date = '';
    $time = '';
} else {
    if (!portal_is_valid_date($date)) {
        json_response(['ok' => false, 'error' => 'Invalid job date'], 422);
    }
    if (!portal_is_valid_time($time)) {
        json_response(['ok' => false, 'error' => 'Invalid job time'], 422);
    }
}

if ($customer === '' || $phone === '' || $address === '' || $summary === '') {
    json_response(['ok' => false, 'error' => 'Customer, phone, address and description are required'], 422);
}

if (strlen($customer) > 160) {
    json_response(['ok' => false, 'error' => 'Customer name is too long'], 422);
}
if (strlen($phone) > 40) {
    json_response(['ok' => false, 'error' => 'Phone number is too long'], 422);
}
if (strlen($address) > 255) {
    json_response(['ok' => false, 'error' => 'Address is too long'], 422);
}

$latStr = $lat === null ? '' : number_format($lat, 7, '.', '');
$lngStr = $lng === null ? '' : number_format($lng, 7, '.', '');
if ($latStr === '' || $lngStr === '') {
    $geo = portal_geocode_search_nz($db, $address, 1, true);
    if (!empty($geo)) {
        $latStr = number_format((float)$geo[0]['lat'], 7, '.', '');
        $lngStr = number_format((float)$geo[0]['lng'], 7, '.', '');
    }
}

$stmt = $db->prepare(
    "INSERT INTO portal_jobs
      (id, job_date, job_time, customer_name, phone, address, lat, lng, summary, status, is_unscheduled, is_deleted, updated_at, created_at)
     VALUES
      (?, NULLIF(?, ''), NULLIF(?, ''), ?, ?, ?, NULLIF(?, ''), NULLIF(?, ''), ?, ?, ?, ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE
      job_date = VALUES(job_date),
      job_time = VALUES(job_time),
      customer_name = VALUES(customer_name),
      phone = VALUES(phone),
      address = VALUES(address),
      lat = VALUES(lat),
      lng = VALUES(lng),
      summary = VALUES(summary),
      status = VALUES(status),
      is_unscheduled = VALUES(is_unscheduled),
      is_deleted = VALUES(is_deleted),
      updated_at = NOW()"
);

if (!$stmt) {
    json_response(['ok' => false, 'error' => 'Failed to prepare save query'], 500);
}

$stmt->bind_param(
    'ssssssssssii',
    $id,
    $date,
    $time,
    $customer,
    $phone,
    $address,
    $latStr,
    $lngStr,
    $summary,
    $status,
    $unscheduled,
    $deleted
);

$ok = $stmt->execute();
$stmt->close();

if (!$ok) {
    json_response(['ok' => false, 'error' => 'Failed to save job'], 500);
}

json_response(['ok' => true, 'id' => $id]);
