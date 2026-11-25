import type {Request} from "express";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {Strategy, ExtractJwt} from "passport-jwt";
import {PassportStrategy} from "@nestjs/passport";
import {ACCESS_TOKEN_NAME} from "@live-bid/services/names";
import {GatewayException} from "@app/gateway/common/filters";
import type {AccessTokenPayload, UserAccess} from "@live-bid/services/types";

export const ACCESS_STRATEGY_NAME = "jwt-access";

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, ACCESS_STRATEGY_NAME) {
  constructor(readonly config: ConfigService) {
    let secretOrKey: string | undefined = config.get<string>("JWT_SECRET");

    if (process.env.NODE_ENV === 'production' && !secretOrKey) throw new GatewayException({
      statusCode: 500,
      code: 'JWT_SECRET_NOT_FOUND',
      message: "JWT_SECRET must be set",
    });

    secretOrKey = 'JWT_SECRET';

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
    };
  }
}
