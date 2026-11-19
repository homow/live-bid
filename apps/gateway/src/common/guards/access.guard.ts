import {Reflector} from "@nestjs/core";
import {AuthGuard} from "@nestjs/passport";
import {ACCESS_STRATEGY_NAME} from "../strategies";
import type {UserAccess} from "@live-bid/services/types";
import {getRequestResponse} from "@app/gateway/lib/utils";
import {GatewayException} from "@app/gateway/common/filters";
import {IS_PUBLIC_KEY, PublicDecoratorParams} from "../decorators";
import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";

/**
 * **AccessTokenGuard**
 *
 * Passport-based authentication guard for the API Gateway.
 * Validates the access token on the request via the `ACCESS_STRATEGY_NAME` strategy.
 *
 * @remarks
 * - **Public bypass:** If the route is marked with `@Public()`
 *   (and `makePublicAccessGuard` is `true`), the guard exits early and allows access.
 * - **Request extraction:** Custom `getRequest` extracts the raw HTTP request from
 *   the execution context (works for both HTTP and GraphQL).
 * - **Failure handling:** Any missing/expired/invalid token results in a
 *   `401 ACCESS_TOKEN_EXPIRED` gateway exception.
 * - **Strategy name:** The actual token verification logic lives in the Passport
 *   strategy registered under `ACCESS_STRATEGY_NAME`.
 *
 * ### Resolution order
 * 1. `@Public()` → bypass
 * 2. Passport strategy validation → attach `req.user`
 * 3. `handleRequest` → throw on failure, return user on success
 *
 * @example
 * // Protect a resolver with the guard
 * @UseGuards(AccessTokenGuard)
 * @Query(() => GetProfileOutput)
 * myProfile(@CurrentUser() user: UserAccess) { ... }
 */
@Injectable()
export class AccessTokenGuard extends AuthGuard(ACCESS_STRATEGY_NAME) implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Extracts the raw request from the execution context.
   *
   * @param context - The current execution context.
   * @returns The underlying HTTP request object.
   */
  // noinspection JSUnusedGlobalSymbols
  getRequest(context: ExecutionContext) {
    const ctx = getRequestResponse(context);
    return ctx.req;
  }

  /**
   * Determines whether the current request is allowed to proceed.
   *
   * @param context - The current execution context (GraphQL resolver or HTTP handler).
   * @returns `true` if access is granted (public route or valid token).
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<PublicDecoratorParams>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || {
      makePublicAccessGuard: false,
      makePublicPermissionGuard: false,
    };

    if (isPublic.makePublicAccessGuard) return true;

    return super.canActivate(context);
  }

  /**
   * Handles the result of the Passport strategy.
   *
   * @param err - Any error thrown by the strategy.
   * @param user - The resolved user (if the token was valid).
   * @param _info
   * @param _context
   * @param _status
   * @returns The authenticated `UserAccess` payload.
   * @throws {GatewayException} 401 `ACCESS_TOKEN_EXPIRED` if the token is
   *   missing, expired, or invalid.
   */
  // noinspection JSUnusedGlobalSymbols
  handleRequest<T = UserAccess>(err: Error, user: T, _info: unknown, _context: ExecutionContext, _status?: unknown) {
    if (err || !user) throw new GatewayException({
      statusCode: 401,
      code: "ACCESS_TOKEN_EXPIRED",
      message: "Access token missing or expired",
    });
    return user;
  }
}
