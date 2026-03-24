<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
portal_require_auth();

$db = portal_db();
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));

if ($method === 'GET') {
    $blogs = [];
    $result = $db->query(
        "SELECT id, slug, title, description, pub_date, hero_image, status, body, is_deleted, created_at, updated_at
         FROM portal_blog_drafts
         ORDER BY updated_at DESC, pub_date DESC, title ASC"
    );
    if ($result === false) {
        json_response(['ok' => false, 'error' => 'Failed to load blog drafts', 'details' => $db->error], 500);
    }

    while ($row = $result->fetch_assoc()) {
        $blogs[] = portal_blog_from_row($row);
    }
    $result->free();

    json_response(['ok' => true, 'blogs' => $blogs]);
}

if ($method !== 'POST') {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

$body = read_json_body();

if (isset($body['deleteId'])) {
    $deleteId = trim((string)$body['deleteId']);
    if ($deleteId === '' || strlen($deleteId) > 64) {
        json_response(['ok' => false, 'error' => 'Invalid draft id'], 422);
    }

    $stmt = $db->prepare("UPDATE portal_blog_drafts SET is_deleted = 1, updated_at = NOW() WHERE id = ?");
    if (!$stmt) {
        json_response(['ok' => false, 'error' => 'Failed to prepare delete query'], 500);
    }
    $stmt->bind_param('s', $deleteId);
    $stmt->execute();
    $stmt->close();

    json_response(['ok' => true]);
}

if (!isset($body['blog']) || !is_array($body['blog'])) {
    json_response(['ok' => false, 'error' => 'Missing blog payload'], 422);
}

$blog = $body['blog'];

$id = trim((string)($blog['id'] ?? ''));
$slug = trim((string)($blog['slug'] ?? ''));
$title = trim((string)($blog['title'] ?? ''));
$description = trim((string)($blog['description'] ?? ''));
$pubDate = trim((string)($blog['pubDate'] ?? ''));
$heroImage = trim((string)($blog['heroImage'] ?? ''));
$status = portal_normalize_blog_status(trim((string)($blog['status'] ?? 'Draft')));
$content = trim((string)($blog['body'] ?? ''));
$deleted = !empty($blog['deleted']) ? 1 : 0;

if ($id === '') {
    $id = (string)round(microtime(true) * 1000) . '-' . substr(str_replace('.', '', uniqid('', true)), -6);
}

if (strlen($id) > 64) {
    json_response(['ok' => false, 'error' => 'Draft id is too long'], 422);
}
if ($title === '' || $description === '' || $content === '') {
    json_response(['ok' => false, 'error' => 'Title, description and content are required'], 422);
}
if (strlen($title) > 180) {
    json_response(['ok' => false, 'error' => 'Title is too long'], 422);
}
if (strlen($description) > 160) {
    json_response(['ok' => false, 'error' => 'Description is too long'], 422);
}
if (!portal_is_valid_date($pubDate)) {
    json_response(['ok' => false, 'error' => 'Invalid publish date'], 422);
}
if ($slug === '' || strlen($slug) > 180 || !portal_is_valid_slug($slug)) {
    json_response(['ok' => false, 'error' => 'Slug must use lowercase letters, numbers and hyphens only'], 422);
}
if ($heroImage !== '' && strlen($heroImage) > 255) {
    json_response(['ok' => false, 'error' => 'Hero image path is too long'], 422);
}

$stmt = $db->prepare(
    "INSERT INTO portal_blog_drafts
      (id, slug, title, description, pub_date, hero_image, status, body, is_deleted, updated_at, created_at)
     VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE
      slug = VALUES(slug),
      title = VALUES(title),
      description = VALUES(description),
      pub_date = VALUES(pub_date),
      hero_image = VALUES(hero_image),
      status = VALUES(status),
      body = VALUES(body),
      is_deleted = VALUES(is_deleted),
      updated_at = NOW()"
);

if (!$stmt) {
    json_response(['ok' => false, 'error' => 'Failed to prepare save query', 'details' => $db->error], 500);
}

$stmt->bind_param(
    'ssssssssi',
    $id,
    $slug,
    $title,
    $description,
    $pubDate,
    $heroImage,
    $status,
    $content,
    $deleted
);

$ok = $stmt->execute();
$error = $stmt->error;
$errno = (int)$stmt->errno;
$stmt->close();

if (!$ok) {
    if ($errno === 1062) {
        json_response(['ok' => false, 'error' => 'That slug is already in use. Choose a different slug.'], 422);
    }
    json_response(['ok' => false, 'error' => 'Failed to save blog draft', 'details' => $error], 500);
}

json_response(['ok' => true, 'id' => $id]);
