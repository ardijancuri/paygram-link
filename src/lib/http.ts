import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Invalid request.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error.";
}

export function serializeBigInt(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeBigInt);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, serializeBigInt(nested)]));
  }

  return value;
}

