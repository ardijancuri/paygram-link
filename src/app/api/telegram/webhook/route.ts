import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { findUserByNotificationToken, setUserTelegramChatId } from "@/lib/repositories";
import { sendTelegramMessage } from "@/lib/notifications";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat?: { id?: string | number };
  };
};

export async function POST(request: Request) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (webhookSecret && request.headers.get("x-telegram-bot-api-secret-token") !== webhookSecret) {
    return jsonError("Invalid Telegram webhook secret.", 401);
  }

  const update = (await request.json()) as TelegramUpdate;
  const text = update.message?.text?.trim() ?? "";
  const chatId = update.message?.chat?.id?.toString();

  if (!chatId || !text.startsWith("/start")) {
    return NextResponse.json({ ok: true });
  }

  const token = text.split(/\s+/)[1];

  if (!token) {
    await sendTelegramMessage(chatId, "Open PayGram Link settings and use your notification link.");
    return NextResponse.json({ ok: true });
  }

  const user = await findUserByNotificationToken(token);

  if (!user) {
    await sendTelegramMessage(chatId, "That PayGram notification link is invalid or expired.");
    return NextResponse.json({ ok: true });
  }

  await setUserTelegramChatId(user.id, chatId);
  await sendTelegramMessage(chatId, "PayGram Link notifications are connected. You will get a message when a payment is detected.");

  return NextResponse.json({ ok: true });
}

