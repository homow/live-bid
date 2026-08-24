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
}
