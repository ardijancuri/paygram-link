import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { requireUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireUser();

    return NextResponse.json({ connected: Boolean(user.telegramChatId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return jsonError(message === "Unauthorized" ? "Sign in first." : message, message === "Unauthorized" ? 401 : 400);
  }
}
