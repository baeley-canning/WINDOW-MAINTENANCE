# Portal Database Setup (MyHost cPanel)

This portal now uses `PHP + MySQL` so your jobs are shared across phone and PC.

## 1) Create database

In cPanel -> `MySQL Databases`:

1. In **Create New Database**, use:
   - suffix: `portal`
2. cPanel will create full DB name similar to:
   - `windowma_portal`

## 2) Create database user

1. In **MySQL Users**, create a user:
   - suffix: `portalusr`
   - strong password (save it)
2. Full username will look like:
   - `windowma_portalusr`

## 3) Add user to database

1. In **Add User To Database**:
   - User: `windowma_portalusr`
   - Database: `windowma_portal`
2. Click **Add**
3. Grant **ALL PRIVILEGES**

## 4) Set credentials (recommended secure method)

Create this file on server (outside webroot):

- `/home/windowma/portal-config.local.php`

Put this in it:

```php
<?php
define('WM_PORTAL_DB_HOST', 'localhost');
define('WM_PORTAL_DB_NAME', 'windowma_portal');
define('WM_PORTAL_DB_USER', 'windowma_portalusr');
define('WM_PORTAL_DB_PASS', 'YOUR_DB_PASSWORD');
define('WM_PORTAL_APP_USER', 'wmadmin');
define('WM_PORTAL_APP_PASS', 'YOUR_PORTAL_PASSWORD');
define('WM_PORTAL_APP_PASS_HASH', ''); // optional password_hash output
define('WM_PORTAL_SESSION_DAYS', 30);
```

The portal loader reads this automatically if present. This keeps secrets out of repo/webroot.

If you cannot create that file, fallback is `public/api/portal/config.php` (already prefilled).

## 5) Deploy

Push to `main` (your GitHub Action deploys automatically to cPanel).

## 6) Verify

Open:

- `https://windowmaintenance.co.nz/api/portal/health.php`

Expected:

- `{ "ok": true, "db": true, ... }`

Then open:

- `https://windowmaintenance.co.nz/portal/`

Sign in and test:

1. Add a test job on PC
2. Open portal on phone and refresh
3. The same job should appear

## Notes

- The DB table is auto-created by the API on first successful DB connection.
- Session login is persistent (30 days) via secure HTTP-only cookie.
- New job statuses supported: `Booked`, `Quoted`, `Awaiting parts`, `In progress`, `Reschedule`, `Done`, `Cancelled`.
- Portal now has:
  - Search by customer/phone/address/notes
  - `To Be Booked` queue with one-tap `Schedule`
  - Duplicate warning when same phone + address already exists
