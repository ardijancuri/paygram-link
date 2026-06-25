create table if not exists users (
  id text primary key,
  telegram_id text not null unique,
  telegram_username text,
  display_name text not null,
  photo_url text,
  telegram_chat_id text,
  notification_link_token text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  token_hash text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists seller_wallets (
  id text primary key,
  user_id text not null unique references users(id) on delete cascade,
  ton_address text not null,
  network text not null default 'testnet',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_links (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  amount_nano bigint not null,
  currency text not null default 'TON',
  recipient_wallet text not null,
  success_message text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_attempts (
  id text primary key,
  payment_link_id text not null references payment_links(id) on delete cascade,
  buyer_wallet text,
  expected_amount_nano bigint not null,
  currency text not null default 'TON',
  memo text not null unique,
  ton_tx_hash text unique,
  status text not null default 'created' check (
    status in ('created', 'submitted', 'pending', 'paid', 'failed', 'expired', 'manual_review')
  ),
  expires_at timestamptz not null,
  detected_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_events (
  id text primary key,
  raw_tx_hash text not null unique,
  recipient_wallet text not null,
  sender_wallet text,
  amount_nano bigint not null,
  memo text,
  matched_attempt_id text references payment_attempts(id) on delete set null,
  detected_at timestamptz not null default now(),
  raw_payload jsonb not null default '{}'::jsonb
);

create index if not exists payment_links_user_id_idx on payment_links(user_id);
create index if not exists payment_links_slug_idx on payment_links(slug);
create index if not exists payment_attempts_link_id_idx on payment_attempts(payment_link_id);
create index if not exists payment_attempts_status_expires_idx on payment_attempts(status, expires_at);
create index if not exists payment_attempts_memo_idx on payment_attempts(memo);
create index if not exists payment_events_recipient_idx on payment_events(recipient_wallet);

