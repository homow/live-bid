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
   * - Only the **hashed** token is stored in Redis for security.
   * - The cache entry expires automatically after 15 minutes (TTL).
   *
   * @param userId - The unique identifier of the user requesting the reset.
   * @returns The raw (unhashed) token if generated, or `null` if a token already exists.
   *
   * @example
   * const rawToken = await this.setPwdToken(user.id);
   * if (!rawToken) {
   *   // A reset email was already sent recently; skip sending.
   * }
   */
  async setPwdToken(userId: string): Promise<string | null> {
    const key = `pwd_reset:${userId}`;

    // Check if a valid token already exists.
    const existingTokenHash = await this.cacheService.get<string>(key);
    if (existingTokenHash) {
      // A reset link was already sent recently; do not send another one.
      return null;
    }

    // Generate a raw reset token and its SHA-256 hash.
    const token = generatePasswordResetToken(userId);
    const tokenHash = hashSecretToken(token);

    // Cache the hashed token with a 15-minute TTL.
    await this.cacheService.set(key, tokenHash, ONE_MINUTE_MS * 15);

    // Return the raw token (to be sent via email).
    return token;
  }
}
