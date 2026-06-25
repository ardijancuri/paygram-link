import { NextResponse } from "next/server";

import { jsonError, serializeBigInt } from "@/lib/http";
import { upsertTelegramUser } from "@/lib/repositories";
import { startSession } from "@/lib/session";

export async function POST() {
  const enabled = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_LOGIN !== "false";

  if (!enabled) {
    return jsonError("Development login is disabled.", 403);
  }

  const user = await upsertTelegramUser({
    telegramId: "dev-paygram-seller",
    telegramUsername: "paygram_dev",
    displayName: "PayGram Test Seller",
    photoUrl: null,
  });

  await startSession(user.id);

  return NextResponse.json({ user: serializeBigInt(user) });
}

