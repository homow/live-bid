import {CookieOptions} from "express";
import {JwtService} from "@nestjs/jwt";
import ms, {type StringValue} from "ms";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {ONE_MINUTE_MS} from "@live-bid/services/lib";
import {CacheService} from "@live-bid/services/cache";
import {hashSecretToken} from "@live-bid/services/lib";
import {generatePasswordResetToken, generateRandomToken} from "@app/auth/lib/utils";
import type {AccessTokenPayload, ResetTokenPayloadTypes} from "@live-bid/services/types";

/**
 * **TokenUtil**
 *
 * Utility service for token generation, cookie configuration, and
 * password-reset token management.
 *
 * @remarks
 * - **Access Tokens:** JWTs signed with `JWT_SECRET`, short-lived (`JWT_EXPIRES`).
 * - **Refresh Tokens:** Opaque tokens formatted as `<userId>:<randomPart>`.
 *   Only their SHA-256 hash is persisted in the database.
 * - **Cookies:** Built with strict security defaults (`httpOnly`, `secure` in
 *   production, `sameSite=strict`). Refresh token max-age adapts to the
 *   "remember me" flag.
 * - **Password Reset:** Uses Redis atomic operations (Lua) to enforce a
 *   15-minute single-use token and an anti-spam per-user lock.
 *
 * ### Available operations
 * | Method | Purpose |
 * |---|---|
 * | `getCookieOptions` | Generate secure cookie configurations |
 * | `getRefreshDate` | Calculate refresh token TTL (12h or 7d) |
 * | `getAccessDate` | Calculate access token TTL from config |
 * | `generateAccessToken` | Sign a JWT access token |
 * | `getAccessAndRefreshTokens` | Generate a complete token pair |
 * | `setPwdToken` | Issue a single-use reset token with anti-spam lock |
 * | `verifyPwdToken` | Consume and validate a reset token |
 */
@Injectable()
export class TokenUtil {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Builds the cookie options for auth tokens.
   *
   * @param type - The target cookie type (`refresh`, `access`, or `logout`).
   * @param remember - Whether the user requested a long-lived session.
   * @returns Secure `CookieOptions` (with `maxAge` for access/refresh).
   */
  getCookieOptions(type: "refresh" | "access" | "logout", remember?: boolean): CookieOptions {
    const isProduction: boolean = this.config.get<string>('NODE_ENV') === "production";

    const maxAge: number = type === "access"
      ? this.getAccessDate()
      : this.getRefreshDate(remember || false);

    const options: CookieOptions = {
      sameSite: isProduction ? "strict" : "lax",
      httpOnly: true,
      secure: isProduction,
      path: "/",
    };

    if (type === "logout") return options;

    return {
      ...options,
      maxAge,
    };
  }

  /**
   * Calculates the refresh-token TTL in milliseconds.
   *
   * @param remember - If `true`, returns 7 days; otherwise 12 hours.
   */
  getRefreshDate(remember: boolean): number {
    return remember
      ? 7 * 24 * 60 * 60 * 1000 // 7 Days
      : 12 * 60 * 60 * 1000;    // 12 Hours
  }


  /**
   * Calculates the access-token TTL in milliseconds from `JWT_EXPIRES`.
   */
  getAccessDate(): number {
    const expiresIn = this.config.get<StringValue>("JWT_EXPIRES") ?? "15m";
    return ms(expiresIn);
  }

  /**
   * Signs a new JWT access token.
   *
   * @param payload - The data to encode inside the token.
   * @returns The signed JWT string.
   * @throws {Error} If `JWT_SECRET` is not configured.
   */
  generateAccessToken(payload: AccessTokenPayload): string {
    const secret = this.config.get<string>("JWT_SECRET");
    if (!secret) throw new Error("JWT_SECRET must be set");

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: this.config.get<StringValue>("JWT_EXPIRES") ?? "15m",
    });
  }

  /**
   * Generates a fresh access/refresh token pair.
   *
   * The refresh token is composed of the user ID and a cryptographically
   * secure random string. Its SHA-256 hash is returned for DB persistence.
   *
   * @param payload - Access token payload (user ID, role, etc.).
   * @param remember - Whether to use the extended refresh TTL.
   * @returns An object containing the raw tokens, hashed refresh token, and expiration date.
   */
  getAccessAndRefreshTokens(payload: AccessTokenPayload, remember: boolean) {
    const randomPart: string = generateRandomToken();
    const refreshToken: string = `${payload.sub}:${randomPart}`;

    const accessToken: string = this.generateAccessToken(payload);

    const expires_in: Date = new Date(
      Date.now() + this.getRefreshDate(remember)
    );

    const hashedRefreshToken: string = hashSecretToken(refreshToken);

    return {
      expires_in,
      accessToken,
      refreshToken,
      hashedRefreshToken,
    };
  }

  /**
   * Issues a new password-reset token for the given user.
   *
   * @remarks
   * - A raw token is generated and **never persisted**; only its SHA-256
   *   hash is used as the Redis key (`pwd_reset:token:<hash>`).
   * - Two keys are written **atomically** via Lua:
   *   - `pwd_reset:token:<hash>` → `{ id, email }` (consumed on verify)
   *   - `pwd_reset:user:<id>`    → `tokenHash` (anti-spam lock)
   * - If the per-user lock already exists (an active reset link was issued
   *   within the last 15 minutes), no new token is created and `null` is
   *   returned. This prevents reset-email spam and abuse.
   * - Both keys share the same TTL (**15 minutes**) and expire together.
   * - The caller is responsible for delivering the raw token via email and
   *   must never log or store it.
   *
   * @param payload - `{ id, email }` of the user requesting the reset.
   * @returns The raw (unhashed) token if a new one was issued,
   *          or `null` if a valid reset link already exists for this user.
   *
   * @example
   * const rawToken = await this.setPwdToken({ id: user.id, email: user.email });
   * if (!rawToken) {
   *   // A reset email was already sent recently — do not send another.
   *   return;
   * }
   * await this.authMail.sendPasswordReset(user.email, rawToken);
   */
  async setPwdToken({id, email}: ResetTokenPayloadTypes): Promise<string | null> {
    // Generate new Token
    const rawToken = generatePasswordResetToken();

    // Hashed Token
    const tokenHash = hashSecretToken(rawToken);

    // Build Keys
    const tokenKey = `pwd_reset:token:${tokenHash}`;
    const userKey = `pwd_reset:user:${id}`; // for lock user

    // Check and set Token Atomic
    const written = await this.cacheService.setPwdTokenAtomic(
      tokenKey,
      userKey,
      {id, email},
      tokenHash,
      ONE_MINUTE_MS * 15,
    );

    if (!written) return null;

    return rawToken;
  }

  /**
   * Verifies a raw password reset token, consumes it (single-use),
   * and returns the associated `{ id, email }`.
   *
   * @remarks
   * - The token is hashed (SHA-256) before lookup; the raw token is never stored.
   * - The token is **consumed atomically** (`GETDEL`): it cannot be reused.
   * - Returns `null` if the token is invalid, expired, or already used.
   * - The per-user lock (`pwd_reset:user:<id>`) is **not** released here;
   *   it expires on its own TTL (15 min). This prevents rapid re-issuance
   *   of new reset links (anti-spam) even after a successful reset.
   *
   * @param token - The raw reset token from the email link.
   * @returns The `{ id, email }` payload, or `null` if invalid/expired/used.
   *
   * @example
   * const payload = await this.verifyPwdToken(rawToken);
   * if (!payload) throw new AppException({ ... "Invalid or expired token" });
   */
  async verifyPwdToken(token: string): Promise<ResetTokenPayloadTypes | null> {
    // Hashed Raw Token for Find in Redis
    const tokenHash = hashSecretToken(token);
    const tokenKey = `pwd_reset:token:${tokenHash}`; // build key

    // Find and delete Token Key with Payload Value
    return this.cacheService.getDel<ResetTokenPayloadTypes>(tokenKey);
  }
}
