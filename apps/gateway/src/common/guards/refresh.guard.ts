import z from "zod";
import {firstValueFrom} from "rxjs";
import type {Request} from "express";
import {ClientProxy} from "@nestjs/microservices";
import {hashSecretToken} from "@live-bid/services/lib";
import {AUTH_PATTERNS} from '@live-bid/services/messages';
import {getRequestResponse} from "@app/gateway/lib/utils";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import {GatewayException} from "@app/gateway/common/filters";
import {CanActivate, type ExecutionContext, Inject, Injectable} from "@nestjs/common";
import {refreshTokenRandomPartSchema, UUIDv7Schema} from "@live-bid/contracts/schemas";
import type {RefreshRequest, RefreshTokenPayload, ValidateRefreshRequestService} from "@live-bid/services/types";

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  static getTokenFromReq<T extends Request>(req: T): string | null {
    const cookies = req.cookies as { refreshToken?: string };
    const header = req.headers['x-refresh-token'];

    return cookies?.refreshToken || (Array.isArray(header) ? header[0] : header) || null;
  }

  async canActivate(context: ExecutionContext) {
    const req = getRequestResponse<RefreshRequest>(context).req;

    const rawToken = RefreshGuard.getTokenFromReq(req);

    if (!rawToken) throw new GatewayException({
      statusCode: 401,
      code: 'REFRESH_TOKEN_EXPIRE',
      message: 'Invalid or expired refresh token',
    });

    const hashed = hashSecretToken(rawToken);
    const [userId, randomToken] = rawToken.split(":");

    // Check user id
    const isValidateUserId = z.safeParse(UUIDv7Schema, userId);

    if (!isValidateUserId.success) throw new GatewayException({
      statusCode: 401,
      code: 'REFRESH_TOKEN_EXPIRE',
      message: 'Invalid or expired refresh token',
    });

    // Check random token
    const isValidateRandomToken = z.safeParse(refreshTokenRandomPartSchema, randomToken);

    if (!isValidateRandomToken) throw new GatewayException({
      statusCode: 401,
      code: 'REFRESH_TOKEN_EXPIRE',
      message: 'Invalid or expired refresh token',
    });

    // Validate refresh token
    req.refreshPayload = await firstValueFrom<RefreshTokenPayload>(
      this.authClient.send(AUTH_PATTERNS.VALIDATE_REFRESH_TOKEN, {
        userId,
        tokenHash: hashed
      } satisfies ValidateRefreshRequestService)
    );

    return true;
  }
}
