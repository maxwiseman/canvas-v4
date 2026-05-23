import { env } from "@canvas-v4/env/server";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const TOKEN_PREFIX = "v1";
const IV_BYTES = 12;

export function encryptSecret(value: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [TOKEN_PREFIX, toBase64Url(iv), toBase64Url(tag), toBase64Url(ciphertext)].join(":");
}

export function decryptSecret(value: string): string {
  const [version, iv, tag, ciphertext] = value.split(":");
  if (version !== TOKEN_PREFIX || !iv || !tag || !ciphertext) {
    return value;
  }

  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), fromBase64Url(iv));
  decipher.setAuthTag(fromBase64Url(tag));
  return Buffer.concat([decipher.update(fromBase64Url(ciphertext)), decipher.final()]).toString("utf8");
}

function getEncryptionKey(): Buffer {
  return createHash("sha256").update(env.BETTER_AUTH_SECRET).digest();
}

function toBase64Url(value: Buffer): string {
  return value.toString("base64url");
}

function fromBase64Url(value: string): Buffer {
  return Buffer.from(value, "base64url");
}
