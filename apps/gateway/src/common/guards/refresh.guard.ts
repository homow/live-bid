import z from "zod";
import type {Request} from "express";
import {hashSecretToken} from "@live-bid/services/lib";
import {getRequestResponse} from "@app/gateway/lib/utils";
import {GatewayException} from "@app/gateway/common/filters";
import type {RefreshRequest} from "@live-bid/services/types";
import {CanActivate, type ExecutionContext, Injectable} from "@nestjs/common";
import {refreshTokenRandomPartSchema, UUIDv7Schema} from "@live-bid/contracts/schemas";

@Injectable()
export class RefreshGuard implements CanActivate {
  static getTokenFromReq<T extends Request>(req: T): string | null {
    const cookies = req.cookies as { refreshToken?: string };
    const header = req.headers['x-refresh-token'];

    return cookies?.refreshToken || (Array.isArray(header) ? header[0] : header) || null;
  }

  canActivate(context: ExecutionContext): boolean {
    const req = getRequestResponse<RefreshRequest>(context).req;

    const rawToken = RefreshGuard.getTokenFromReq(req);

    if (!rawToken) throw new GatewayException({
      statusCode: 401,
      code: 'REFRESH_TOKEN_EXPIRE',
      message: 'Invalid or expired refresh token',
    });

    const tokenHash = hashSecretToken(rawToken);
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
    req.refreshGuardData = {
      userId,
      tokenHash,
    };

    return true;
  }
}
