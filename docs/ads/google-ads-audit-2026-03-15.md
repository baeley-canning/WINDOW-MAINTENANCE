# Google Ads Audit - 2026-03-15

## Bottom Line

Lead volume is being limited by three problems:

1. Too much spend is still going to weak or wrong search intent.
2. Too much paid traffic is still landing on the homepage or junk pages.
3. Mobile traffic is much less efficient than desktop, but it consumes most of the budget.

## What The Files Show

### Device performance

Source: `Device report.csv`

- `Computers`: 198 clicks, 7 conversions, `3.54%` conv. rate, `NZD 79.21` cost/conv.
- `Mobile phones`: 670 clicks, 10 conversions, `1.49%` conv. rate, `NZD 127.43` cost/conv.
- `Tablets`: 38 clicks, 0 conversions, `NZD 46.65` wasted.

Interpretation:

- Desktop is currently the strongest traffic.
- Mobile is still the biggest volume source, but it converts far worse.
- Tablet traffic is dead spend until proven otherwise.

### Landing pages

Source: `Landing page report (1).csv`

Highest-spend pages:

- `/` advertiser-selected: 578 clicks, `NZD 1044.64`
- `/` automatic: 50 clicks, `NZD 120.30`
- `/services/mitre-reseal/`: 35 clicks, `NZD 33.06`
- `/services/sliding-door-repairs/`: 29 clicks, `NZD 69.33`
- `/services/window-repairs/`: 24 clicks, `NZD 64.25`

Waste pages with spend:

- `/blog/`: `NZD 96.74`
- `/areas/` and suburb pages: about `NZD 68.95`
- `/reviews/`: about `NZD 36.39`
- `http://windowmaintenance.co.nz/`: `NZD 10.88`
- `/gallery/`: `NZD 6.38`

Interpretation:

- At least `NZD 219+` has gone to pages that should not be taking search-campaign traffic.
- Final URL expansion / automatic landing-page expansion is still causing drift.

### Search terms

Source: `Search terms report (3).csv`

Best signal terms:

- `aluminium window repairs wellington`
- `aluminium door repairs wellington`
- `sliding door repairs near me`
- `window latches repairs`
- `broken window repairs near me`
- `window maintenance near me`

Waste buckets identified:

#### Competitor leakage

- About `NZD 101.05`
- About `37 clicks`
- Only `1` conversion

Examples:

- `exceed windows`
- `exceed windows wellington`
- `exceed windows and doors`
- `firstwindows co nz`
- `nu look aluminium`
- `metro windows and doors`

#### Replacement / install intent

- About `NZD 129.90`
- About `37 clicks`
- `0` conversions

Examples:

- `aluminium joinery wellington`
- `house window replacement`
- `cheap window replacement`
- `window replacement near me`
- `install bi folding doors`
- `sliding door window replacement`

#### Wrong trade / wrong product

- About `NZD 4.87`
- About `2 clicks`
- `0` conversions

Examples:

- `security screen door repairs near me`
- `wooden window repairs near me`

### Ad groups

Calculated from `Search terms report (3).csv`, excluding the useful summary rows for decision-making:

- `Window Repairs`: `NZD 430.26`, 7 conversions, CPA about `NZD 61.47`
- `Stays & Hinges`: `NZD 267.58`, 1 conversion, CPA about `NZD 267.58`
- `Sliding Door Repairs`: `NZD 101.11`, 1 conversion, CPA about `NZD 101.11`
- `Draughts & Leaks`: `NZD 31.76`, 0 conversions
- `Handles & Locks`: `NZD 30.21`, 0 conversions
- `Security Stay`: `NZD 3.31`, 0 conversions

Interpretation:

- `Window Repairs` is the current winner.
- `Stays & Hinges` is the main money leak.
- `Sliding Door Repairs` is worth keeping, but it needs tighter query control and stronger matching.
- `Draughts & Leaks`, `Handles & Locks`, and `Security Stay` should not be allowed to keep matching broad/junk traffic.

### Auction insights

Source: `Auction insights report (1).csv`

- Your impression share: `10.17%`
- Strong overlap seen with:
  - `wellingtonglass.co.nz`
  - `builderscrack.co.nz`
  - `jimshandyman.co.nz`

Interpretation:

- You are not even entering a large share of the possible auctions.
- But increasing budget before removing waste would just scale the wrong traffic.

## Immediate Actions

### 1. Turn off landing-page drift

- Disable final URL expansion / automatic landing page expansion.
- Stop sending search traffic to:
  - `/blog/`
  - `/reviews/`
  - `/gallery/`
  - `/areas/`
  - `http://windowmaintenance.co.nz/`

Use only service-intent pages:

- `/services/window-repairs/`
- `/services/sliding-door-repairs/`
- `/services/mitre-reseal/`
- `/services/hardware-wedge-replacement/`
- `/security/`
- `/stays/`
- `/services/lock-picking/`
- `/contact/` only for quote-focused ad variants

### 2. Rebuild `Stays & Hinges`

Current state:

- Too much competitor traffic
- Too much generic `aluminium joinery` traffic

Recommended:

- Pause broad match in this ad group.
- Keep only exact/phrase around:
  - `awning stay replacement`
  - `window stay replacement`
  - `window hinge repair`
  - `awning window restrictor`
  - `security stay installation`

### 3. Tighten `Window Repairs`

Keep and expand around:

- `aluminium window repairs wellington`
- `window latches repairs`
- `broken window repairs near me`
- `window maintenance near me`
- `aluminium door repairs wellington`

Reduce or isolate:

- generic `aluminium joinery wellington`
- `window maintenance wellington`
- any broad variant that keeps pulling replacement or competitor traffic

### 4. Tighten `Sliding Door Repairs`

Keep and expand around:

- `sliding door repairs near me`
- `ranchslider repairs`
- `sliding door roller replacement`
- `sliding door track repair`

Remove:

- `double glazed sliding doors` if it keeps behaving like supply/replacement intent
- replacement or install terms

### 5. Cut the waste with negatives

Add negatives from the lists in `google-ads-negatives-2026-03-15.txt`.

### 6. Stop paying for tablet traffic

- Tablets: 38 clicks, 0 conversions.
- Exclude or suppress tablet traffic if the current campaign controls allow it.

### 7. Keep mobile, but force it onto tighter landing pages

Mobile is weak right now, but it is the volume source.
Do not cut it first. First:

- stop homepage-heavy routing
- stop junk query matching
- use tighter service landing pages

## About Google's AI report maker

It may be useful for quick summaries, but it will not replace the raw exports.

Good prompts to use:

- `Show me search terms with more than NZD 10 spend and zero conversions in the last 90 days`
- `Show me landing pages with spend and low CTR in the last 90 days`
- `Show me ad groups ranked by cost per conversion in the last 90 days`
- `Show me competitor brand search terms that triggered my ads in the last 90 days`

Use it for convenience, not for decision quality.
