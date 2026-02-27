# Google Ads Audit - 2026-02-27

Data sources reviewed:
- Auction insights report.csv
- Ad report (3).csv
- Landing page report.csv
- Search keyword report.csv
- Search terms report (2).csv
- exceed google ads keyword report.csv
- Overview - 285-431-4190 - Google Ads.pdf

## Executive Summary
- Active ads spend: NZ,552.17 for 9 conversions (CPA NZ.46).
- Active keyword set spend: NZ,052.16 for 8 conversions (CPA NZ.52).
- Account is mostly broad match (high leak risk) and has ad relevance issues in multiple ad groups.
- exceed.co.nz impression share is higher than yours (18.75% vs 10.02%).

## Additional findings from your Overview screenshot (PDF)
- Campaign diagnostics shows: Not targeting relevant searches.
- Top searches include competitor/brand terms (exceed windows, window rescue, etc.), which can waste spend unless isolated.
- Networks panel indicates non-trivial traffic outside core Google Search, which can dilute lead quality.
- Conversion tracking summary shows issues: Tag inactive and No recent conversions with Recording conversions: 0 at time of export.
- Top bidding signals show strongest intent windows by device/time:
  - Desktop + weekdays 2PM to 4PM
  - Mobile + weekdays 8AM to 12PM
  - Wellington + weekends 9AM to 5PM

## What to change now (priority order)

### 1) Pause obvious spend leaks (no conversions)
Pause these keywords now:
- window repair (Broad, Window Repairs): 89 clicks, NZ.42, 0 conv
- windows for my house (Broad): 16 clicks, NZ.16, 0 conv
- luminium window repair (Broad): 21 clicks, NZ.16, 0 conv
- glazing repairs (Broad): 12 clicks, NZ.43, 0 conv
- window servicing (Broad): 8 clicks, NZ.39, 0 conv

### 2) Replace broad-only structure with phrase + exact
Current converting core terms should become phrase and exact immediately:
- sliding door repair (currently best CPA)
- window fix
- window and door repair
- window latches repairs
- window maintenance near me
- sliding door repairs near me

Build each ad group with:
- 60-70% phrase + exact
- 30-40% broad max (only for proven terms)

### 3) Fix ad relevance issues (hurting conversion rate)
These ad groups have clicks but 0 conversions and weak relevance:
- Draughts & Leaks: 38 clicks, NZ.01, 0 conv
- Handles & Locks: 71 clicks, NZ.56, 0 conv
- Security Stay: 29 clicks, NZ.54, 0 conv

Critical copy fix:
- Remove/replace Roller Door Maintenance headline in non-roller ad groups.

### 4) Tighten final URLs and disable URL drift
Landing traffic is fragmented across many pages/variants:
- https://windowmaintenance.co.nz
- https://windowmaintenance.co.nz/
- http://windowmaintenance.co.nz/
- blog/reviews/gallery pages receiving paid clicks

Actions:
- Standardize all ad final URLs to HTTPS canonical with trailing slash.
- Disable final URL expansion / AI landing-page auto-selection for this core search campaign.
- Keep each ad group pointing to one intent-matched page.

### 5) Network and schedule controls
- Keep campaign on Search network only for lead quality.
- If Search Partners is enabled, test OFF for 2 weeks and compare CPA.
- Apply bid adjustments aligned to observed high-intent windows (desktop weekday afternoon, mobile morning).

### 6) Ad group to page mapping (recommended)
- Window Repairs -> /services/window-repairs/
- Sliding Door Repairs -> /services/sliding-door-repairs/
- Stays & Hinges -> /stays/
- Draughts & Leaks -> /services/mitre-reseal/
- Handles & Locks -> /hardware/
- Security Stay -> /security/
- Form-focused variant -> /contact/ (for form conversion campaigns)

### 7) Add negatives from your actual search terms
Start with phrase negatives:
- window replacement program
- government window replacement program
- or seniors
- wooden
- 	imber

Conditional negatives (if you do NOT want competitor traffic):
- exceed
- irst windows
- metro windows
- 
u look
- window rescue

Note: competitor query exceed windows and doors converted once at low CPA. If you keep competitor terms, isolate into a separate low-budget competitor ad group.

### 8) Conversion tracking stabilization
- Ensure Form submit - Contact is primary for the campaign.
- Keep call conversions secondary if form volume is your main KPI.
- Validate with Tag Assistant until status moves from No recent conversions to active recording.
- Keep one conversion event per outcome to avoid duplicate or conflicting goals.

## Competitor keyword report: what to use vs ignore
From exceed report, many terms are out-of-scope (new windows, flyscreens, non-Wellington cities).
Do NOT import blindly.

High-intent candidates to test in Wellington campaign:
- window repair wellington
- luminium door repairs
- luminium windows wellington
- anch slider rollers
- sliding door rollers nz
- window security stays
- luminium window latches
- yale locks nz (if lock/lockout service is active)

## Weekly operating rules
- Pause any keyword/ad with >NZ spend and 0 conversions.
- Move any converting search term into exact/phrase within 24h.
- Keep one ad group = one intent = one landing page.
- Review search terms every 3 days and add negatives.
