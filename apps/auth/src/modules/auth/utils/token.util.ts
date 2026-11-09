import {CookieOptions} from "express";
import {JwtService} from "@nestjs/jwt";
import ms, {type StringValue} from "ms";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {ONE_MINUTE_MS} from "@live-bid/services/lib";
import {CacheService} from "@live-bid/services/cache";
import type {AccessTokenPayload} from "@live-bid/services/types";
import {generatePasswordResetToken, generateRandomToken, hashSecretToken} from "@app/auth/lib";

@Injectable()
export class TokenUtil {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
  ) {}

  /** **get same refreshToken options** */
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

  /** **Get refresh token date** */
  getRefreshDate(remember: boolean): number {
    return remember
      ? 7 * 24 * 60 * 60 * 1000 // 7 Days
      : 12 * 60 * 60 * 1000;    // 12 Hours
  }

  /** **Get Access Token Date** */
  getAccessDate(): number {
    const expiresIn = this.config.get<StringValue>("JWT_EXPIRES") ?? "15m";
    return ms(expiresIn);
  }

  /** **generate new accessToken with payload** */
  generateAccessToken(payload: AccessTokenPayload): string {
    const secret = this.config.get<string>("JWT_SECRET");
    if (!secret) throw new Error("JWT_SECRET must be set");

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: this.config.get<StringValue>("JWT_EXPIRES") ?? "15m",
    });
  }

  /** **Get and return refresh and access** */
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
   * Generates a password reset token, hashes it, and caches it in Redis.
   *
   * @remarks
   * - If a valid (non-expired) reset token already exists for the user,
   *   a new one is **not** generated. This prevents email spam and abuse.
   * - Only the **hashed** token is used as the Redis **key**; its **value** is the `userId`.
   * - The cache entry expires automatically after 15 minutes (TTL).
   * - The raw token is returned **only once** to be sent via email; it is never stored.
   *
   * @param userId - The unique identifier of the user requesting the reset.
   * @returns The raw (unhashed) token if generated, or `null` if a valid token already exists.
   *
   * @example
   * const rawToken = await this.setPwdToken(user.id);
   * if (!rawToken) {
   *   // A reset email was already sent recently; skip sending.
   * }
   */
  async setPwdToken(userId: string): Promise<string | null> {
    // Generate a raw reset token and its SHA-256 hash.
    const token = generatePasswordResetToken();
    const tokenHash = hashSecretToken(token);

    // Use the hashed token as the Redis key (never the raw token).
    const key = `pwd_reset:${tokenHash}`;

    // Check if a valid token already exists for this user.
    const existingUserId = await this.cacheService.get<string>(key);

    if (existingUserId) {
      // A reset link was already sent recently; do not send another one.
      return null;
    }

    // Cache the hashed token → userId mapping with a 15-minute TTL.
    await this.cacheService.set(key, userId, ONE_MINUTE_MS * 15);

    // Return the raw token (to be sent via email).
    return token;
  }

  /**
   * Verifies a raw password reset token and returns the associated `userId`.
   *
   * @remarks
   * - The token is hashed (SHA-256) before lookup; the raw token is never stored.
   * - Returns `null` if the token is invalid, expired, or already used.
   * - This method does **not** consume (delete) the token; the caller is
   *   responsible for deleting it after a successful password reset.
   *
   * @param token - The raw reset token received from the user (e.g. from the email link).
   * @returns The `userId` associated with the token, or `null` if invalid/expired.
   *
   * @example
   * const userId = await this.verifyPwdToken(rawToken);
   * if (!userId) throw new AppException({ ... "Invalid or expired token" });
   */
  async verifyPwdToken(token: string): Promise<string | null> {
    // Hash the raw token with SHA-256 (same as when it was stored).
    const tokenHash = hashSecretToken(token);

    // Look up the hashed token in Redis; the value is the associated userId.
    return this.cacheService.get<string>(`pwd_reset:${tokenHash}`);
  }
}
