import type {Request} from "express";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {Strategy, ExtractJwt} from "passport-jwt";
import {PassportStrategy} from "@nestjs/passport";
import {ACCESS_TOKEN_NAME} from "@live-bid/services/names";
import type {AccessTokenPayload, UserAccess} from "@live-bid/services/types";

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, "jwt-access") {
  constructor(readonly config: ConfigService) {
    const secretOrKey: string = config.get<string>("JWT_SECRET") ?? "JWT_SECRET";

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookies = req.cookies as Record<string, string> | undefined;
          return cookies?.[ACCESS_TOKEN_NAME] || null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),
      ignoreExpiration: false,
      passReqToCallback: false,
      secretOrKey,
    });
  }

  validate(payload: AccessTokenPayload): UserAccess {
    return {
      userId: payload.sub,
      exp: payload.exp,
      iat: payload.iat,
      jti: payload.jti,
      role: payload.role,
      display_name: payload.display_name ?? "",
    };
  }
}
