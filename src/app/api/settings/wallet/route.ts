import { NextResponse } from "next/server";
import { z } from "zod";

import { getErrorMessage, jsonError, serializeBigInt } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { normalizeTonAddress } from "@/lib/ton";
import { upsertSellerWallet } from "@/lib/repositories";

const walletSchema = z.object({
  tonAddress: z.string().min(24, "Enter a TON testnet wallet address."),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = walletSchema.parse(await request.json());
    const normalized = normalizeTonAddress(body.tonAddress);
    const wallet = await upsertSellerWallet({ userId: user.id, tonAddress: normalized });

    return NextResponse.json({ wallet: serializeBigInt(wallet) });
  } catch (error) {
    const message = getErrorMessage(error);
    return jsonError(message === "Unauthorized" ? "Sign in first." : message, message === "Unauthorized" ? 401 : 400);
  }
}

