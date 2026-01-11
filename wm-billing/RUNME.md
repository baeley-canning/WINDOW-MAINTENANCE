# Window Maintenance — Billing & Payments Portal

This is a production‑ready Next.js 14 (App Router) + Prisma app for invoicing, Stripe payments, and payouts.

## Quick Start (Local Dev)

1) Requirements
- Node 18+
- PNPM or NPM

2) Install deps
- `cd wm-billing`
- `npm install`

3) Configure env
- `cp .env.example .env`
- For local dev use SQLite: set
  - `DATABASE_PROVIDER="sqlite"`
  - `DATABASE_URL="file:./dev.db"`

4) Init DB
- `npx prisma migrate dev --name init`

5) Run
- `npm run dev` (http://localhost:3001)
- First login: go to `/signin`, enter your email; the first user becomes OWNER.

## Stripe & Webhooks (Dev)
- Set `STRIPE_SECRET_KEY` in `.env`
- Create a webhook to `http://localhost:3001/api/stripe/webhook`
  - With Stripe CLI: `stripe listen --forward-to localhost:3001/api/stripe/webhook`
  - Put the `webhook signing secret` into `STRIPE_WEBHOOK_SECRET`
- Optional: Set `STRIPE_PAYMENT_METHOD_TYPES` depending on your Stripe account.
  - For BECS + Card use: `STRIPE_PAYMENT_METHOD_TYPES="au_becs_debit,card"` (requires AU/NZ BECS enabled on your Stripe account).

## SMTP (Dev)
- Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` to your cPanel mail server.

## Production (Render/Vercel)
- Provision Postgres (e.g., Supabase) and Upstash Redis.
- Set env:
  - `DATABASE_PROVIDER=postgresql`
  - `DATABASE_URL=...`
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - `NEXTAUTH_URL=https://billing.windowmaintenance.co.nz`
  - `PUBLIC_BASE_URL_APP=https://billing.windowmaintenance.co.nz`
  - `PUBLIC_BASE_URL_PAY=https://pay.windowmaintenance.co.nz`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - SMTP vars as above.
- Run migrations:
  - `npx prisma migrate deploy`
- Point DNS:
  - `billing.windowmaintenance.co.nz` and `pay.windowmaintenance.co.nz` → hosting.
- Stripe: set payout schedule to Manual; set webhook to `/api/stripe/webhook`.

## Acceptance
- Create invoice → Send “to pay” (email + PDF with Pay link)
- Public Pay page shows bank transfer details + Stripe Checkout
- Webhook flips to PAID on success; admin can mark bank transfer received
- Export CSVs; Payouts page shows available balance and starts a payout
