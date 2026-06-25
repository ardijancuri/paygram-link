import { describe, expect, it } from "vitest";

import { buildTonTransferCommentPayload, formatNanoTon, parseTonToNano } from "@/lib/ton";

describe("TON helpers", () => {
  it("converts TON strings to nanoTON", () => {
    expect(parseTonToNano("1").toString()).toBe("1000000000");
    expect(parseTonToNano("2.5").toString()).toBe("2500000000");
    expect(parseTonToNano("0.000000001").toString()).toBe("1");
  });

  it("formats nanoTON values", () => {
    expect(formatNanoTon(1_000_000_000n)).toBe("1");
    expect(formatNanoTon(2_500_000_000n)).toBe("2.5");
    expect(formatNanoTon(1n)).toBe("0.000000001");
  });

  it("builds a base64 transfer comment payload", () => {
    const payload = buildTonTransferCommentPayload("paygram:att_test");
    expect(payload.length).toBeGreaterThan(10);
    expect(() => Buffer.from(payload, "base64")).not.toThrow();
  });
});

