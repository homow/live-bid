import {hash} from "bcrypt";
import {createHash} from "node:crypto";

/** hashed password with bcrypt */
export async function hashSecret(
  value: string,
  saltRounds: number = 12
): Promise<string> {
  return await hash(value, saltRounds);
}

/** **hashed refresh token on SHA256** */
export function hashSecretToken(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
