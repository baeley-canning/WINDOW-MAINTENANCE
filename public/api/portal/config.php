<?php
declare(strict_types=1);

if (basename(__FILE__) === basename((string)($_SERVER['SCRIPT_FILENAME'] ?? ''))) {
    http_response_code(403);
    exit('Forbidden');
}

/*
 * Update these values to match your MyHost cPanel MySQL details.
 * Example names with cPanel account prefix:
 * - DB name:    windowma_portal
 * - DB user:    windowma_portalusr
 */
define('WM_PORTAL_DB_HOST', 'localhost');
define('WM_PORTAL_DB_NAME', 'windowma_portal');
define('WM_PORTAL_DB_USER', 'windowma_portalusr');
define('WM_PORTAL_DB_PASS', 'CassiusCan');

/*
 * Portal login credentials.
 * Optional: use WM_PORTAL_APP_PASS_HASH (password_hash output) and leave
 * WM_PORTAL_APP_PASS blank.
 */
define('WM_PORTAL_APP_USER', 'wmadmin');
define('WM_PORTAL_APP_PASS', 'wmportal2026');
define('WM_PORTAL_APP_PASS_HASH', '');

define('WM_PORTAL_SESSION_DAYS', 30);
