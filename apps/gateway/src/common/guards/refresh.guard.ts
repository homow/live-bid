import z from "zod";
import type {Request} from "express";
import {hashSecretToken} from "@live-bid/services/lib";
import {getRequestResponse} from "@app/gateway/lib/utils";
import {GatewayException} from "@app/gateway/common/filters";
import type {RefreshRequest} from "@live-bid/services/types";
import {CanActivate, type ExecutionContext, Injectable} from "@nestjs/common";
import {refreshTokenRandomPartSchema, UUIDv7Schema} from "@live-bid/contracts/schemas";

/**
 * **RefreshGuard**
 *
 * NestJS Guard that validates the format and integrity of the refresh token
 * before allowing a token-rotation (`refresh`) request to proceed.
 *
 * @remarks
 * - **Token source:** Reads the refresh token from the `refreshToken` cookie
 *   first, falling back to the `x-refresh-token` HTTP header.
 * - **Structure:** The raw token must follow the format `<UUIDv7>:<randomPart>`.
 * - **Validation:**
 *   - The `userId` part must be a valid UUIDv7.
 *   - The `randomPart` must match `refreshTokenRandomPartSchema`.
 * - **State injection:** On success, attaches `{ userId, tokenHash }` to
 *   `req.refreshGuardData` for downstream handlers.
 * - **Hashing:** The stored `tokenHash` is the SHA-256 hash of the **raw** token;
 *   the raw value is never persisted.
 *
 * @example
 * // Protect the refresh mutation with the guard
 * @UseGuards(RefreshGuard)
 * @Mutation(() => LoginUserOutput)
 * refresh(@Context() ctx: GraphQLContext<RefreshRequest>) { ... }
 */
@Injectable()
export class RefreshGuard implements CanActivate {
  /**
   * Extracts the raw refresh token from the request.
   *
   * Priority:
   * 1. `refreshToken` cookie
   * 2. `x-refresh-token` header
   *
   * @param req - The incoming Express request.
   * @returns The raw token, or `null` if not present.
   */
  static getTokenFromReq<T extends Request>(req: T): string | null {
    const cookies = req.cookies as { refreshToken?: string };
    const header = req.headers['x-refresh-token'];

    return cookies?.refreshToken || (Array.isArray(header) ? header[0] : header) || null;
  }

  /**
   * Validates the refresh token and injects guard data into the request.
   *
   * @param context - The current execution context (GraphQL resolver or HTTP handler).
   * @returns `true` if the token is present and well-formed.
   * @throws {GatewayException} 401 `REFRESH_TOKEN_EXPIRE` if the token is missing,
   *   malformed, or fails schema validation.
   */
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

    if (!isValidateRandomToken.success) throw new GatewayException({
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
