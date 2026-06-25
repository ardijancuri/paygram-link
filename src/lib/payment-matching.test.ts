import { describe, expect, it } from "vitest";

import { findMatchingAttempt, isMatchingTonTransfer } from "@/lib/payment-matching";

const attempt = {
  id: "att_1",
  expectedAmountNano: "2000000000",
  memo: "paygram:att_1",
  recipientWallet: "recipient",
  currency: "TON" as const,
};

describe("payment matching", () => {
  it("matches recipient, amount, currency, and memo", () => {
    expect(
      isMatchingTonTransfer(attempt, {
        txHash: "tx_1",
        recipientWallet: "recipient",
        senderWallet: "buyer",
        amountNano: "2000000000",
        memo: "paygram:att_1",
      }),
    ).toBe(true);
  });

  it("rejects wrong memo", () => {
    expect(
      findMatchingAttempt([attempt], {
        txHash: "tx_1",
        recipientWallet: "recipient",
        senderWallet: "buyer",
        amountNano: "2000000000",
        memo: "paygram:other",
      }),
    ).toBeNull();
  });
});

