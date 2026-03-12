<?php
declare(strict_types=1);

if (basename(__FILE__) === basename((string)($_SERVER['SCRIPT_FILENAME'] ?? ''))) {
    http_response_code(403);
    exit('Forbidden');
}

/**
 * Safe config loading order:
 * 1) Constants defined in local include file (recommended, outside webroot)
 * 2) Environment variables
 * 3) Fallback defaults below (kept for backward compatibility)
 */

function wm_portal_env(string $key, string $fallback = ''): string
{
    $value = getenv($key);
    if ($value !== false && $value !== null && trim((string)$value) !== '') {
        return trim((string)$value);
    }
    if (isset($_ENV[$key]) && trim((string)$_ENV[$key]) !== '') {
        return trim((string)$_ENV[$key]);
    }
    if (isset($_SERVER[$key]) && trim((string)$_SERVER[$key]) !== '') {
        return trim((string)$_SERVER[$key]);
    }
    return $fallback;
}

// Optional local overrides (first match wins if constants are defined there).
$wmPortalConfigFiles = [
    dirname(__DIR__, 3) . '/portal-config.local.php', // preferred: /home/<cpanel-user>/portal-config.local.php
    dirname(__DIR__, 2) . '/portal-config.local.php', // fallback inside webroot if needed
];
foreach ($wmPortalConfigFiles as $wmPortalConfigFile) {
    if (is_file($wmPortalConfigFile) && is_readable($wmPortalConfigFile)) {
        require_once $wmPortalConfigFile;
    }
}

// Backward-compatible defaults (current live values).
$wmPortalDefaults = [
    'WM_PORTAL_DB_HOST' => 'localhost',
    'WM_PORTAL_DB_NAME' => 'windowma_portal',
    'WM_PORTAL_DB_USER' => 'windowma_portalusr',
    'WM_PORTAL_DB_PASS' => 'CassiusCan',
    'WM_PORTAL_APP_USER' => 'wmadmin',
    'WM_PORTAL_APP_PASS' => 'wmportal2026',
    'WM_PORTAL_APP_PASS_HASH' => '',
    'WM_PORTAL_SESSION_DAYS' => '30',
];

if (!defined('WM_PORTAL_DB_HOST')) {
    define('WM_PORTAL_DB_HOST', wm_portal_env('WM_PORTAL_DB_HOST', $wmPortalDefaults['WM_PORTAL_DB_HOST']));
}
if (!defined('WM_PORTAL_DB_NAME')) {
    define('WM_PORTAL_DB_NAME', wm_portal_env('WM_PORTAL_DB_NAME', $wmPortalDefaults['WM_PORTAL_DB_NAME']));
}
if (!defined('WM_PORTAL_DB_USER')) {
    define('WM_PORTAL_DB_USER', wm_portal_env('WM_PORTAL_DB_USER', $wmPortalDefaults['WM_PORTAL_DB_USER']));
}
if (!defined('WM_PORTAL_DB_PASS')) {
    define('WM_PORTAL_DB_PASS', wm_portal_env('WM_PORTAL_DB_PASS', $wmPortalDefaults['WM_PORTAL_DB_PASS']));
}
if (!defined('WM_PORTAL_APP_USER')) {
    define('WM_PORTAL_APP_USER', wm_portal_env('WM_PORTAL_APP_USER', $wmPortalDefaults['WM_PORTAL_APP_USER']));
}
if (!defined('WM_PORTAL_APP_PASS')) {
    define('WM_PORTAL_APP_PASS', wm_portal_env('WM_PORTAL_APP_PASS', $wmPortalDefaults['WM_PORTAL_APP_PASS']));
}
if (!defined('WM_PORTAL_APP_PASS_HASH')) {
    define('WM_PORTAL_APP_PASS_HASH', wm_portal_env('WM_PORTAL_APP_PASS_HASH', $wmPortalDefaults['WM_PORTAL_APP_PASS_HASH']));
}
if (!defined('WM_PORTAL_SESSION_DAYS')) {
    define('WM_PORTAL_SESSION_DAYS', max(1, (int)wm_portal_env('WM_PORTAL_SESSION_DAYS', $wmPortalDefaults['WM_PORTAL_SESSION_DAYS'])));
}
