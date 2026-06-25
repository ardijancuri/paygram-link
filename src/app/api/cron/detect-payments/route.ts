import { NextResponse } from "next/server";

import { detectPayments } from "@/lib/detection";
import { jsonError } from "@/lib/http";

function isAuthorized(request: Request) {
  const configuredSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  const headerSecret = request.headers.get("x-cron-secret");

  return Boolean(configuredSecret && (bearer === configuredSecret || headerSecret === configuredSecret));
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return jsonError("Unauthorized cron request.", 401);
  }

  const result = await detectPayments();
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  return GET(request);
}

