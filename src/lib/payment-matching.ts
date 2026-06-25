import { normalizeTonAddress } from "@/lib/ton";

export type MatchableAttempt = {
  id: string;
  expectedAmountNano: string | bigint;
  memo: string;
  recipientWallet: string;
  currency: "TON";
};

export type IncomingTonTransfer = {
  txHash: string;
  recipientWallet: string;
  senderWallet: string | null;
  amountNano: string | bigint;
  memo: string | null;
  rawPayload?: unknown;
};

function normalizeAddressForMatch(value: string) {
  try {
    return normalizeTonAddress(value);
  } catch {
    return value.trim();
  }
}

export function isMatchingTonTransfer(attempt: MatchableAttempt, transfer: IncomingTonTransfer) {
  return (
    attempt.currency === "TON" &&
    normalizeAddressForMatch(attempt.recipientWallet) === normalizeAddressForMatch(transfer.recipientWallet) &&
    BigInt(attempt.expectedAmountNano) === BigInt(transfer.amountNano) &&
    attempt.memo === transfer.memo
  );
}

export function findMatchingAttempt(attempts: MatchableAttempt[], transfer: IncomingTonTransfer) {
  return attempts.find((attempt) => isMatchingTonTransfer(attempt, transfer)) ?? null;
}

