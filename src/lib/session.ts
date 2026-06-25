import { cookies } from "next/headers";

import { createSecretToken, sha256 } from "@/lib/ids";
import {
  createSession,
  deleteSession,
  findUserBySessionHash,
  type User,
} from "@/lib/repositories";

export const sessionCookieName = "paygram_session";
const sessionDays = 30;

export async function startSession(userId: string) {
  const token = createSecretToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);

  await createSession({ tokenHash, userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await deleteSession(sha256(token));
  }

  cookieStore.delete(sessionCookieName);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  return findUserBySessionHash(sha256(token));
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

