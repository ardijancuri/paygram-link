import { NextResponse } from "next/server";
import { z } from "zod";

import { getErrorMessage, jsonError, serializeBigInt } from "@/lib/http";
import {
  createPaymentAttempt,
  getPaymentAttempt,
  getPaymentLinkById,
  updatePaymentAttemptStatus,
} from "@/lib/repositories";
import { buildTonTransferCommentPayload, normalizeTonAddress } from "@/lib/ton";

const createAttemptSchema = z.object({
  paymentLinkId: z.string().min(1),
  buyerWallet: z.string().optional().nullable(),
});

const updateAttemptSchema = z.object({
  id: z.string().min(1),
  buyerWallet: z.string().optional().nullable(),
  status: z.enum(["pending", "failed", "submitted"]),
});

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    return jsonError("Missing payment attempt id.", 400);
  }

  const attempt = await getPaymentAttempt(id);

  if (!attempt) {
    return jsonError("Payment attempt not found.", 404);
  }

  return NextResponse.json({ attempt: serializeBigInt(attempt) });
}

export async function POST(request: Request) {
  try {
    const body = createAttemptSchema.parse(await request.json());
    const link = await getPaymentLinkById(body.paymentLinkId);

    if (!link) {
      return jsonError("Payment link not found.", 404);
    }

    const buyerWallet = body.buyerWallet ? normalizeTonAddress(body.buyerWallet) : null;
    const attempt = await createPaymentAttempt({
      paymentLinkId: link.id,
      buyerWallet,
      expectedAmountNano: link.amountNano,
    });

    return NextResponse.json(
      {
        attempt: serializeBigInt(attempt),
        transaction: {
          validUntil: Math.floor(Date.now() / 1000) + 10 * 60,
          messages: [
            {
              address: link.recipientWallet,
              amount: link.amountNano.toString(),
              payload: buildTonTransferCommentPayload(attempt.memo),
            },
          ],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(getErrorMessage(error), 400);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = updateAttemptSchema.parse(await request.json());
    const buyerWallet = body.buyerWallet ? normalizeTonAddress(body.buyerWallet) : null;
    const attempt = await updatePaymentAttemptStatus({
      id: body.id,
      status: body.status,
      buyerWallet,
    });

    if (!attempt) {
      return jsonError("Payment attempt could not be updated.", 404);
    }

    return NextResponse.json({ attempt: serializeBigInt(attempt) });
  } catch (error) {
    return jsonError(getErrorMessage(error), 400);
  }
}

