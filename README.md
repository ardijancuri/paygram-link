# PayGram Link

PayGram Link is a non-custodial TON testnet payment-link app for Telegram sellers, creators, freelancers, and communities.

The MVP supports:

- Telegram seller login.
- Seller TON testnet receiving wallet settings.
- Shareable payment links.
- Public TON Connect checkout pages.
- Payment attempts with `paygram:<attemptId>` transfer comments.
- Cron-based TON testnet payment detection.
- Telegram bot notifications when payments are detected.

## Stack

- Next.js App Router with TypeScript and Tailwind CSS.
- Plain PostgreSQL through `postgres`.
- SQL migrations in `db/migrations`.
- TON Connect UI and `@ton/core`.
- Telegram Login Widget and Bot API.

No Prisma is used.

## Local Setup

1. Copy `.env.example` to `.env.local` and fill the values.
2. Create a PostgreSQL database.
3. Run migrations:

```bash
npm run migrate
```

4. Start the app:

```bash
npm run dev
```

For local development, `ENABLE_DEV_LOGIN=true` enables the test seller sign-in button.

## Hostinger + Supabase

Hostinger's Supabase wizard asks for two app changes:

1. Add `@supabase/supabase-js` to `dependencies`.
2. Create `db.js` next to `package.json` with a Supabase client connection test.

Those changes are present in this repo. The smoke test uses the real `users` table:

```bash
SUPABASE_URL="https://..."
SUPABASE_API_KEY="..."
```

PayGram Link's production routes still use Supabase as a PostgreSQL database through the existing `postgres` SQL client. That means the app also needs a direct Postgres connection string.

Also set this variable in Hostinger:

```bash
DATABASE_URL="postgresql://..."
```

Use the Supabase Postgres connection string from Project Settings > Database. On hosts without IPv6 support, use Supabase's connection pooler URL. Keep SSL enabled; the app requires SSL automatically for non-local database URLs.

Before using the deployed app, apply `db/migrations/001_initial.sql` to the Supabase database, either through the Supabase SQL Editor or by running `npm run migrate` with `DATABASE_URL` pointed at Supabase.

## Telegram Setup

Create a bot with BotFather, then set:

```bash
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_BOT_USERNAME="your_bot"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="your_bot"
TELEGRAM_WEBHOOK_SECRET="..."
```

Point the bot webhook at:

```text
https://your-domain.com/api/telegram/webhook
```

Include `TELEGRAM_WEBHOOK_SECRET` as Telegram's webhook secret token.

## Payment Detection

The cron endpoint is:

```text
GET /api/cron/detect-payments
Authorization: Bearer <CRON_SECRET>
```

It polls TON testnet transactions for active payment attempts, records transaction events idempotently, marks matching attempts as paid, and sends Telegram notifications.

## Commands

```bash
npm run lint
npm run test
npm run build
```
