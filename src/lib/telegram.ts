import crypto from "node:crypto";
import { z } from "zod";

export const telegramLoginSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    username: z.string().optional(),
    photo_url: z.string().url().optional(),
    auth_date: z.union([z.string(), z.number()]).transform((value) => Number(value)),
    hash: z.string(),
  })
  .passthrough();

export type TelegramLoginPayload = z.infer<typeof telegramLoginSchema>;

export function getTelegramDisplayName(payload: Pick<TelegramLoginPayload, "first_name" | "last_name" | "username">) {
  const name = [payload.first_name, payload.last_name].filter(Boolean).join(" ").trim();
  return name || payload.username || "Telegram seller";
}

export function verifyTelegramLogin(payload: TelegramLoginPayload, botToken: string, maxAgeSeconds = 86_400) {
  const { hash, ...data } = payload;
  const authAgeSeconds = Math.floor(Date.now() / 1000) - payload.auth_date;

  if (authAgeSeconds < 0 || authAgeSeconds > maxAgeSeconds) {
    return false;
  }

  const dataCheckString = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const expectedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  const expected = Buffer.from(expectedHash, "hex");
  const received = Buffer.from(hash, "hex");

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

