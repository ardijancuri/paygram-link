import { NextResponse } from "next/server";

import { jsonError, serializeBigInt } from "@/lib/http";
import { startSession } from "@/lib/session";
import { getTelegramDisplayName, telegramLoginSchema, verifyTelegramLogin } from "@/lib/telegram";
import { upsertTelegramUser } from "@/lib/repositories";

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return jsonError("TELEGRAM_BOT_TOKEN is not configured.", 500);
  }

  const payload = telegramLoginSchema.parse(await request.json());
  const isValid = verifyTelegramLogin(
    payload,
    botToken,
    Number(process.env.TELEGRAM_AUTH_MAX_AGE_SECONDS ?? 86_400),
  );

  if (!isValid) {
    return jsonError("Telegram login verification failed.", 401);
  }

  const user = await upsertTelegramUser({
    telegramId: payload.id,
    telegramUsername: payload.username ?? null,
    displayName: getTelegramDisplayName(payload),
    photoUrl: payload.photo_url ?? null,
  });

  await startSession(user.id);

  return NextResponse.json({ user: serializeBigInt(user) });
}

