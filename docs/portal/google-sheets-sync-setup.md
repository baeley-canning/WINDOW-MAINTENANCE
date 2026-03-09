# Portal Sync Setup (Google Sheets)

Use this once to sync `/portal/` across mobile + desktop.

## 1. Create the sheet

1. Create a new Google Sheet.
2. Name the first tab `Jobs`.
3. Put this in `A1`: `json`
4. Leave `A2` blank for now.

## 2. Create Apps Script

1. In the Sheet: `Extensions` -> `Apps Script`
2. Delete existing code.
3. Paste this script:

```javascript
const SHEET_NAME = "Jobs";
const SECRET = "REPLACE_WITH_YOUR_LONG_RANDOM_TOKEN";

function doGet(e) {
  try {
    const params = e.parameter || {};
    if (params.token !== SECRET) return json({ ok: false, error: "Unauthorized" }, 401);
    if ((params.action || "") !== "list") return json({ ok: false, error: "Invalid action" }, 400);

    const sheet = getSheet();
    const raw = String(sheet.getRange("A2").getValue() || "[]");
    let jobs = [];
    try { jobs = JSON.parse(raw); } catch (err) { jobs = []; }
    if (!Array.isArray(jobs)) jobs = [];

    return json({ ok: true, jobs: jobs }, 200);
  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) }, 500);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (body.token !== SECRET) return json({ ok: false, error: "Unauthorized" }, 401);
    if ((body.action || "") !== "replace") return json({ ok: false, error: "Invalid action" }, 400);

    const jobs = Array.isArray(body.jobs) ? body.jobs : [];
    const sheet = getSheet();
    sheet.getRange("A1").setValue("json");
    sheet.getRange("A2").setValue(JSON.stringify(jobs));

    return json({ ok: true, count: jobs.length }, 200);
  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) }, 500);
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  return sheet;
}

function json(payload, statusCode) {
  const out = ContentService.createTextOutput(JSON.stringify(payload));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}
```

4. Replace `SECRET` with a long random token.
5. Click `Deploy` -> `New deployment`.
6. Type: `Web app`.
7. Execute as: `Me`.
8. Who has access: `Anyone`.
9. Deploy and copy the `Web app URL`.

## 3. Connect portal

1. Open `https://windowmaintenance.co.nz/portal/`.
2. Log in.
3. In `Cross-device Sync`:
   - `Sync URL` = the Apps Script web app URL
   - `Sync token` = the same `SECRET` value
4. Click `Save sync settings`.
5. Click `Sync now` once.

## 4. Verify

1. Add a test job on desktop.
2. Wait a few seconds (auto-sync), or click `Sync now`.
3. Open portal on mobile and log in.
4. Click `Sync now` and confirm the same job appears.

## Notes

- Portal keeps local offline copy in browser storage.
- Sync uses latest `updatedAt` per job id to resolve conflicts.
- Deletions are soft-deleted and sync across devices.
