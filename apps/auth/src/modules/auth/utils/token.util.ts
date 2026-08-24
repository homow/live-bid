import ms, {StringValue} from "ms";
import {CookieOptions} from "express";
import {JwtService} from "@nestjs/jwt";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import type {AccessTokenPayload} from "@app/auth/types";
import {generateRandomToken, hashSecretToken} from "@app/auth/lib";

@Injectable()
export class AuthUtil {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
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
  getTokens(payload: AccessTokenPayload, remember: boolean) {
    const randomPart: string = generateRandomToken();
    const refreshToken: string = `${payload.sub}:${randomPart}`;

    const accessToken: string = this.generateAccessToken(payload);

    const expires_at: Date = new Date(
      Date.now() + this.getRefreshDate(remember)
    );

    const hashedRefreshToken: string = hashSecretToken(refreshToken);

    return {
      expires_at,
      accessToken,
      refreshToken,
      hashedRefreshToken,
    };
  }
}
