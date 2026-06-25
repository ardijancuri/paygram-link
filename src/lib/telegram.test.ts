import crypto from "node:crypto";
import { describe, expect, it } from "vitest";

import { verifyTelegramLogin, type TelegramLoginPayload } from "@/lib/telegram";

function signPayload(payload: Omit<TelegramLoginPayload, "hash">, botToken: string) {
  const dataCheckString = Object.entries(payload)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  return crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
}

describe("Telegram login verification", () => {
  it("accepts signed Telegram login payloads", () => {
    const botToken = "12345:test-token";
    const payload = {
      id: "42",
      first_name: "Ada",
      username: "ada",
      auth_date: Math.floor(Date.now() / 1000),
    };

    expect(verifyTelegramLogin({ ...payload, hash: signPayload(payload, botToken) }, botToken)).toBe(true);
  });

  it("rejects tampered payloads", () => {
    const botToken = "12345:test-token";
    const payload = {
      id: "42",
      first_name: "Ada",
      username: "ada",
      auth_date: Math.floor(Date.now() / 1000),
    };

    expect(
      verifyTelegramLogin({ ...payload, username: "mallory", hash: signPayload(payload, botToken) }, botToken),
    ).toBe(false);
  });
});

