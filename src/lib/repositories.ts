import { getSql } from "@/lib/db";
import { createId, createSecretToken } from "@/lib/ids";
import { fallbackSlug } from "@/lib/slug";
import { normalizeTonAddress } from "@/lib/ton";

export type User = {
  id: string;
  telegramId: string;
  telegramUsername: string | null;
  displayName: string;
  photoUrl: string | null;
  telegramChatId: string | null;
  notificationLinkToken: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SellerWallet = {
  id: string;
  userId: string;
  tonAddress: string;
  network: "testnet";
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentLink = {
  id: string;
  userId: string;
  slug: string;
  title: string;
  description: string | null;
  amountNano: bigint;
  currency: "TON";
  recipientWallet: string;
  successMessage: string | null;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentAttemptStatus =
  | "created"
  | "submitted"
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "manual_review";

export type PaymentAttempt = {
  id: string;
  paymentLinkId: string;
  buyerWallet: string | null;
  expectedAmountNano: bigint;
  currency: "TON";
  memo: string;
  tonTxHash: string | null;
  status: PaymentAttemptStatus;
  expiresAt: Date;
  detectedAt: Date | null;
  confirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentLinkWithStats = PaymentLink & {
  paidAttempts: number;
  totalAttempts: number;
};

export type DashboardMetrics = {
  totalLinks: number;
  paidLinks: number;
  totalVolumeNano: bigint;
};

type UserRow = {
  id: string;
  telegram_id: string;
  telegram_username: string | null;
  display_name: string;
  photo_url: string | null;
  telegram_chat_id: string | null;
  notification_link_token: string;
  created_at: Date;
  updated_at: Date;
};

type WalletRow = {
  id: string;
  user_id: string;
  ton_address: string;
  network: "testnet";
  created_at: Date;
  updated_at: Date;
};

type LinkRow = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string | null;
  amount_nano: string | number | bigint;
  currency: "TON";
  recipient_wallet: string;
  success_message: string | null;
  status: "active" | "archived";
  created_at: Date;
  updated_at: Date;
};

type AttemptRow = {
  id: string;
  payment_link_id: string;
  buyer_wallet: string | null;
  expected_amount_nano: string | number | bigint;
  currency: "TON";
  memo: string;
  ton_tx_hash: string | null;
  status: PaymentAttemptStatus;
  expires_at: Date;
  detected_at: Date | null;
  confirmed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    telegramId: row.telegram_id,
    telegramUsername: row.telegram_username,
    displayName: row.display_name,
    photoUrl: row.photo_url,
    telegramChatId: row.telegram_chat_id,
    notificationLinkToken: row.notification_link_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapWallet(row: WalletRow): SellerWallet {
  return {
    id: row.id,
    userId: row.user_id,
    tonAddress: row.ton_address,
    network: row.network,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLink(row: LinkRow): PaymentLink {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    amountNano: BigInt(row.amount_nano),
    currency: row.currency,
    recipientWallet: row.recipient_wallet,
    successMessage: row.success_message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAttempt(row: AttemptRow): PaymentAttempt {
  return {
    id: row.id,
    paymentLinkId: row.payment_link_id,
    buyerWallet: row.buyer_wallet,
    expectedAmountNano: BigInt(row.expected_amount_nano),
    currency: row.currency,
    memo: row.memo,
    tonTxHash: row.ton_tx_hash,
    status: row.status,
    expiresAt: row.expires_at,
    detectedAt: row.detected_at,
    confirmedAt: row.confirmed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function upsertTelegramUser(input: {
  telegramId: string;
  telegramUsername?: string | null;
  displayName: string;
  photoUrl?: string | null;
}) {
  const sql = getSql();
  const rows = await sql<UserRow[]>`
    insert into users (
      id,
      telegram_id,
      telegram_username,
      display_name,
      photo_url,
      notification_link_token
    )
    values (
      ${createId("usr")},
      ${input.telegramId},
      ${input.telegramUsername ?? null},
      ${input.displayName},
      ${input.photoUrl ?? null},
      ${createSecretToken(18)}
    )
    on conflict (telegram_id) do update set
      telegram_username = excluded.telegram_username,
      display_name = excluded.display_name,
      photo_url = excluded.photo_url,
      updated_at = now()
    returning *
  `;

  return mapUser(rows[0]);
}

export async function createSession(input: { tokenHash: string; userId: string; expiresAt: Date }) {
  const sql = getSql();
  await sql`
    insert into sessions (token_hash, user_id, expires_at)
    values (${input.tokenHash}, ${input.userId}, ${input.expiresAt})
  `;
}

export async function deleteSession(tokenHash: string) {
  const sql = getSql();
  await sql`delete from sessions where token_hash = ${tokenHash}`;
}

export async function findUserBySessionHash(tokenHash: string) {
  const sql = getSql();
  const rows = await sql<UserRow[]>`
    select users.*
    from sessions
    join users on users.id = sessions.user_id
    where sessions.token_hash = ${tokenHash}
      and sessions.expires_at > now()
    limit 1
  `;

  return rows[0] ? mapUser(rows[0]) : null;
}

export async function findUserByNotificationToken(token: string) {
  const sql = getSql();
  const rows = await sql<UserRow[]>`
    select *
    from users
    where notification_link_token = ${token}
    limit 1
  `;

  return rows[0] ? mapUser(rows[0]) : null;
}

export async function setUserTelegramChatId(userId: string, chatId: string) {
  const sql = getSql();
  const rows = await sql<UserRow[]>`
    update users
    set telegram_chat_id = ${chatId}, updated_at = now()
    where id = ${userId}
    returning *
  `;

  return rows[0] ? mapUser(rows[0]) : null;
}

export async function getSellerWallet(userId: string) {
  const sql = getSql();
  const rows = await sql<WalletRow[]>`
    select *
    from seller_wallets
    where user_id = ${userId}
    limit 1
  `;

  return rows[0] ? mapWallet(rows[0]) : null;
}

export async function upsertSellerWallet(input: { userId: string; tonAddress: string }) {
  const sql = getSql();
  const normalized = normalizeTonAddress(input.tonAddress);
  const rows = await sql<WalletRow[]>`
    insert into seller_wallets (id, user_id, ton_address, network)
    values (${createId("wlt")}, ${input.userId}, ${normalized}, 'testnet')
    on conflict (user_id) do update set
      ton_address = excluded.ton_address,
      network = 'testnet',
      updated_at = now()
    returning *
  `;

  return mapWallet(rows[0]);
}

export async function createPaymentLink(input: {
  userId: string;
  title: string;
  description?: string | null;
  amountNano: bigint;
  recipientWallet: string;
  successMessage?: string | null;
}) {
  const sql = getSql();
  const baseSlug = fallbackSlug(input.title);

  for (let index = 0; index < 20; index += 1) {
    const slug = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;

    try {
      const rows = await sql<LinkRow[]>`
        insert into payment_links (
          id,
          user_id,
          slug,
          title,
          description,
          amount_nano,
          currency,
          recipient_wallet,
          success_message
        )
        values (
          ${createId("lnk")},
          ${input.userId},
          ${slug},
          ${input.title},
          ${input.description ?? null},
          ${input.amountNano.toString()},
          'TON',
          ${normalizeTonAddress(input.recipientWallet)},
          ${input.successMessage ?? null}
        )
        returning *
      `;

      return mapLink(rows[0]);
    } catch (error) {
      if (isUniqueViolation(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Could not generate a unique payment link slug.");
}

export async function listPaymentLinks(userId: string) {
  const sql = getSql();
  const rows = await sql<(LinkRow & { paid_attempts: string | number; total_attempts: string | number })[]>`
    select
      payment_links.*,
      count(payment_attempts.id) filter (where payment_attempts.status = 'paid') as paid_attempts,
      count(payment_attempts.id) as total_attempts
    from payment_links
    left join payment_attempts on payment_attempts.payment_link_id = payment_links.id
    where payment_links.user_id = ${userId}
    group by payment_links.id
    order by payment_links.created_at desc
  `;

  return rows.map((row) => ({
    ...mapLink(row),
    paidAttempts: Number(row.paid_attempts),
    totalAttempts: Number(row.total_attempts),
  }));
}

export async function getPaymentLinkBySlug(slug: string) {
  const sql = getSql();
  const rows = await sql<LinkRow[]>`
    select *
    from payment_links
    where slug = ${slug} and status = 'active'
    limit 1
  `;

  return rows[0] ? mapLink(rows[0]) : null;
}

export async function getPaymentLinkById(id: string) {
  const sql = getSql();
  const rows = await sql<LinkRow[]>`
    select *
    from payment_links
    where id = ${id} and status = 'active'
    limit 1
  `;

  return rows[0] ? mapLink(rows[0]) : null;
}

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const sql = getSql();
  const rows = await sql<{ total_links: string | number; paid_links: string | number; total_volume_nano: string | number | null }[]>`
    select
      count(distinct payment_links.id) as total_links,
      count(distinct payment_links.id) filter (where payment_attempts.status = 'paid') as paid_links,
      coalesce(sum(payment_attempts.expected_amount_nano) filter (where payment_attempts.status = 'paid'), 0) as total_volume_nano
    from payment_links
    left join payment_attempts on payment_attempts.payment_link_id = payment_links.id
    where payment_links.user_id = ${userId}
  `;

  const row = rows[0];

  return {
    totalLinks: Number(row?.total_links ?? 0),
    paidLinks: Number(row?.paid_links ?? 0),
    totalVolumeNano: BigInt(row?.total_volume_nano ?? 0),
  };
}

export async function createPaymentAttempt(input: {
  paymentLinkId: string;
  buyerWallet?: string | null;
  expectedAmountNano: bigint;
}) {
  const sql = getSql();
  const id = createId("att");
  const memo = `paygram:${id}`;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const rows = await sql<AttemptRow[]>`
    insert into payment_attempts (
      id,
      payment_link_id,
      buyer_wallet,
      expected_amount_nano,
      currency,
      memo,
      expires_at
    )
    values (
      ${id},
      ${input.paymentLinkId},
      ${input.buyerWallet ?? null},
      ${input.expectedAmountNano.toString()},
      'TON',
      ${memo},
      ${expiresAt}
    )
    returning *
  `;

  return mapAttempt(rows[0]);
}

export async function getPaymentAttempt(id: string) {
  const sql = getSql();
  const rows = await sql<AttemptRow[]>`
    select *
    from payment_attempts
    where id = ${id}
    limit 1
  `;

  return rows[0] ? mapAttempt(rows[0]) : null;
}

export async function updatePaymentAttemptStatus(input: {
  id: string;
  status: PaymentAttemptStatus;
  buyerWallet?: string | null;
}) {
  const sql = getSql();
  const rows = await sql<AttemptRow[]>`
    update payment_attempts
    set
      status = ${input.status},
      buyer_wallet = coalesce(${input.buyerWallet ?? null}, buyer_wallet),
      updated_at = now()
    where id = ${input.id}
      and status in ('created', 'submitted', 'pending')
    returning *
  `;

  return rows[0] ? mapAttempt(rows[0]) : null;
}

export async function listDetectablePaymentAttempts() {
  const sql = getSql();
  const rows = await sql<(AttemptRow & { recipient_wallet: string; user_id: string; link_title: string; telegram_chat_id: string | null })[]>`
    select
      payment_attempts.*,
      payment_links.recipient_wallet,
      payment_links.user_id,
      payment_links.title as link_title,
      users.telegram_chat_id
    from payment_attempts
    join payment_links on payment_links.id = payment_attempts.payment_link_id
    join users on users.id = payment_links.user_id
    where payment_attempts.status in ('created', 'submitted', 'pending')
      and payment_attempts.expires_at > now()
    order by payment_attempts.created_at desc
    limit 200
  `;

  return rows.map((row) => ({
    attempt: mapAttempt(row),
    recipientWallet: row.recipient_wallet,
    userId: row.user_id,
    linkTitle: row.link_title,
    telegramChatId: row.telegram_chat_id,
  }));
}

export async function expireOldPaymentAttempts() {
  const sql = getSql();
  const rows = await sql<{ count: string | number }[]>`
    with expired as (
      update payment_attempts
      set status = 'expired', updated_at = now()
      where status in ('created', 'submitted', 'pending')
        and expires_at <= now()
      returning id
    )
    select count(*) as count from expired
  `;

  return Number(rows[0]?.count ?? 0);
}

export async function recordPaymentEvent(input: {
  rawTxHash: string;
  recipientWallet: string;
  senderWallet: string | null;
  amountNano: bigint | string;
  memo: string | null;
  matchedAttemptId: string | null;
  rawPayload: unknown;
}) {
  const sql = getSql();
  await sql`
    insert into payment_events (
      id,
      raw_tx_hash,
      recipient_wallet,
      sender_wallet,
      amount_nano,
      memo,
      matched_attempt_id,
      raw_payload
    )
    values (
      ${createId("evt")},
      ${input.rawTxHash},
      ${input.recipientWallet},
      ${input.senderWallet},
      ${input.amountNano.toString()},
      ${input.memo},
      ${input.matchedAttemptId},
      ${JSON.stringify(input.rawPayload ?? {})}
    )
    on conflict (raw_tx_hash) do nothing
  `;
}

export async function markAttemptPaid(input: { attemptId: string; txHash: string }) {
  const sql = getSql();
  const rows = await sql<AttemptRow[]>`
    update payment_attempts
    set
      status = 'paid',
      ton_tx_hash = ${input.txHash},
      detected_at = coalesce(detected_at, now()),
      confirmed_at = coalesce(confirmed_at, now()),
      updated_at = now()
    where id = ${input.attemptId}
      and status <> 'paid'
    returning *
  `;

  return rows[0] ? mapAttempt(rows[0]) : null;
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

