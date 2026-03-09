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

## 4) Put DB credentials in project

Edit this file:

- `public/api/portal/config.php`

Set:

- `WM_PORTAL_DB_PASS`

`WM_PORTAL_DB_HOST` should stay `localhost` on MyHost.

`WM_PORTAL_DB_NAME` and `WM_PORTAL_DB_USER` are already prefilled as:

- `windowma_portal`
- `windowma_portalusr`

## 5) Optional: change portal login

In the same file, change:

- `WM_PORTAL_APP_USER`
- `WM_PORTAL_APP_PASS`

## 6) Deploy

Push to `main` (your GitHub Action deploys automatically to cPanel).

## 7) Verify

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
