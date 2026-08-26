import {DrizzleService} from "@live-bid/services/database";
import {CanActivate, ExecutionContext} from "@nestjs/common";
import {getRequestResponse} from "@app/gateway/lib";
import type {RefreshRequest} from "@live-bid/services/types";
import {AppException} from "@live-bid/services/lib";
import {hashSecretToken} from "@app/auth/lib";

export class RefreshGuard implements CanActivate {
  constructor(
    private readonly drizzle: DrizzleService,
  ) {}

  static getTokenFromReq(req: RefreshRequest): string | null {
    const cookies = req.cookies as { refreshToken?: string };
    const header = req.headers['x-refresh-token'];

    return cookies?.refreshToken || (Array.isArray(header) ? header[0] : header) || null;
  }

  canActivate(context: ExecutionContext) {
    const {req} = getRequestResponse(context);

    const rawToken = RefreshGuard.getTokenFromReq(req as RefreshRequest);

    if (!rawToken) throw new AppException({
      statusCode: 401,
      code: "REFRESH_TOKEN_MISSING",
      message: "Refresh token missing.",
    });

    const hashed = hashSecretToken(rawToken);
    const userId = rawToken.split(":")[0];
  }
}
