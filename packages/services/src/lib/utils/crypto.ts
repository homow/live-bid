import {createHash} from "node:crypto";

/** **hashed refresh token on SHA256** */
export function hashSecretToken(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
