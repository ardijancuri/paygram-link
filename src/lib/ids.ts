import crypto from "node:crypto";

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(12).toString("hex")}`;
}

export function createSecretToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

