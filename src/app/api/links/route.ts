import { NextResponse } from "next/server";
import { z } from "zod";

import { getErrorMessage, jsonError, serializeBigInt } from "@/lib/http";
import { createPaymentLink, getSellerWallet, listPaymentLinks } from "@/lib/repositories";
import { requireUser } from "@/lib/session";
import { parseTonToNano } from "@/lib/ton";

const createLinkSchema = z.object({
  title: z.string().trim().min(2, "Title is required.").max(90, "Title is too long."),
  description: z.string().trim().max(500, "Description is too long.").optional(),
  amount: z.string().trim().min(1, "Amount is required."),
  successMessage: z.string().trim().max(500, "Success message is too long.").optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const links = await listPaymentLinks(user.id);
    return NextResponse.json({ links: serializeBigInt(links) });
  } catch (error) {
    return jsonError(getErrorMessage(error), 401);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const wallet = await getSellerWallet(user.id);

    if (!wallet) {
      return jsonError("Add a receiving TON wallet before creating payment links.", 400);
    }

    const body = createLinkSchema.parse(await request.json());
    const link = await createPaymentLink({
      userId: user.id,
      title: body.title,
      description: body.description || null,
      amountNano: parseTonToNano(body.amount),
      recipientWallet: wallet.tonAddress,
      successMessage: body.successMessage || null,
    });

    return NextResponse.json({ link: serializeBigInt(link) }, { status: 201 });
  } catch (error) {
    const message = getErrorMessage(error);
    return jsonError(message === "Unauthorized" ? "Sign in first." : message, message === "Unauthorized" ? 401 : 400);
  }
}

