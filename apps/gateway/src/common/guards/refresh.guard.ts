import {CanActivate, type ExecutionContext, Inject, Injectable} from "@nestjs/common";
import {getRequestResponse} from "@app/gateway/lib";
import type {RefreshRequest, RefreshTokenPayload, ValidateRefreshRequest} from "@live-bid/services/types";
import {AppException} from "@live-bid/services/lib";
import {hashSecretToken} from "@app/auth/lib";
import {AUTH_PATTERNS} from '@live-bid/services/messages';
import {ClientProxy, MessagePattern} from "@nestjs/microservices";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import {firstValueFrom} from "rxjs";

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  static getTokenFromReq(req: RefreshRequest): string | null {
    const cookies = req.cookies as { refreshToken?: string };
    const header = req.headers['x-refresh-token'];

    return cookies?.refreshToken || (Array.isArray(header) ? header[0] : header) || null;
  }

  async canActivate(context: ExecutionContext) {
    const req = getRequestResponse(context).req as RefreshRequest;

    const rawToken = RefreshGuard.getTokenFromReq(req);

    if (!rawToken) throw new AppException({
      statusCode: 401,
      code: "REFRESH_TOKEN_MISSING",
      message: "Refresh token missing.",
    });

    const hashed = hashSecretToken(rawToken);
    const userId = rawToken.split(":")[0];

    req.refreshPayload = await firstValueFrom<RefreshTokenPayload>(
      this.authClient.send(AUTH_PATTERNS.VALIDATE_REFRESH_TOKEN, {
        userId,
        tokenHash: hashed
      } satisfies ValidateRefreshRequest)
    );

    return true;
  }
}
