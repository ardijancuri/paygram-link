import type { IncomingTonTransfer } from "@/lib/payment-matching";

type UnknownRecord = Record<string, unknown>;

export async function fetchIncomingTonTransfers(address: string): Promise<IncomingTonTransfer[]> {
  const endpoint = process.env.TONCENTER_API_BASE_URL ?? "https://testnet.toncenter.com/api/v3/transactions";
  const url = new URL(endpoint);
  url.searchParams.set("account", address);
  url.searchParams.set("limit", "100");
  url.searchParams.set("sort", "desc");

  const headers: Record<string, string> = {};

  if (process.env.TONCENTER_API_KEY) {
    headers["X-API-Key"] = process.env.TONCENTER_API_KEY;
  }

  const response = await fetch(url, { headers, cache: "no-store" });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TON indexer request failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as unknown;
  return parseToncenterV3Transfers(payload, address);
}

export function parseToncenterV3Transfers(payload: unknown, fallbackRecipient: string): IncomingTonTransfer[] {
  const root = asRecord(payload);
  const transactions = Array.isArray(root?.transactions)
    ? root.transactions
    : Array.isArray(root?.items)
      ? root.items
      : Array.isArray(payload)
        ? payload
        : [];

  return transactions
    .map((transaction) => parseTransaction(transaction, fallbackRecipient))
    .filter((transfer): transfer is IncomingTonTransfer => transfer !== null);
}

function parseTransaction(transaction: unknown, fallbackRecipient: string): IncomingTonTransfer | null {
  const tx = asRecord(transaction);
  if (!tx) {
    return null;
  }

  const inMessage = asRecord(tx.in_msg ?? tx.inMessage ?? tx.in_msg_descr ?? tx.inMessageDescr);

  if (!inMessage) {
    return null;
  }

  const amount = getString(inMessage.value ?? inMessage.amount ?? inMessage.value_grams);

  if (!amount || amount === "0") {
    return null;
  }

  const txHash = getString(tx.hash ?? tx.transaction_hash ?? tx.tx_hash ?? tx.lt) ?? "";

  if (!txHash) {
    return null;
  }

  return {
    txHash,
    recipientWallet: getString(inMessage.destination ?? inMessage.dest ?? inMessage.destination_address) ?? fallbackRecipient,
    senderWallet: getString(inMessage.source ?? inMessage.src ?? inMessage.source_address),
    amountNano: amount,
    memo: extractComment(inMessage),
    rawPayload: transaction,
  };
}

function extractComment(message: UnknownRecord) {
  const messageContent = asRecord(message.message_content ?? message.messageContent ?? message.content);
  const decoded = asRecord(messageContent?.decoded);

  return (
    getString(decoded?.comment) ??
    getString(decoded?.text) ??
    getString(message.comment) ??
    getString(message.message) ??
    null
  );
}

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : null;
}

function getString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return value.toString();
  }

  return null;
}
