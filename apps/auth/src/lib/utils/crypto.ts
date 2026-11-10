import {hash, compare} from "bcrypt";
import {randomBytes} from "node:crypto";

/** hashed password with bcrypt */
export async function hashSecret(
  value: string,
  saltRounds: number = 12
): Promise<string> {
  return await hash(value, saltRounds);
}

/** compare hashed password with bcrypt */
export async function compareSecret(
  value: string,
  hashed: string
): Promise<boolean> {
  return await compare(value, hashed);
}

/** generate refresh token from randomBytes */
export function generateRandomToken(): string {
  return randomBytes(64).toString("hex");
}

/** **generate password reset token (short-lived, 32 bytes)** */
export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("hex");
}
