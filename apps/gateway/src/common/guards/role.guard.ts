import {Reflector} from "@nestjs/core";
import {isRoleAccess} from "@live-bid/services/lib";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {getRequestResponse} from "@app/gateway/lib/utils";
import type {AccessRequest} from "@live-bid/services/types";
import {GatewayException} from "@app/gateway/common/filters";
import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {IS_PUBLIC_KEY, PublicDecoratorParams, ROLE_METADATA, RoleDecoratorParams} from "@app/gateway/common/decorators";

/**
 * **RoleGuard**
 *
 * NestJS Guard that enforces Role-Based Access Control (RBAC) on resolvers
 * and controllers in the API Gateway.
 *
 * @remarks
 * - **Public bypass:** If the route is marked with `@Public()` (and
 *   `makePublicRoleGuard` is `true`), this guard exits early and allows access.
 * - **Metadata resolution:** Reads `ROLE_METADATA` from the handler or the
 *   controller class (method-level overrides class-level).
 * - **Defaults:** If no role metadata is present, it requires at least
 *   `UserRoleEnum.USER` in **strict** mode.
 * - **Evaluation:** Uses `isRoleAccess()` to support both strict (exact match)
 *   and hierarchical (equal or higher) role checks.
 * - **Failure:** Throws a `403 ROLE_NOT_ALLOWED` with a descriptive message,
 *   distinguishing between strict and hierarchical mode.
 *
 * ### Resolution order
 * 1. `@Public()` → bypass
 * 2. `@Roles()` metadata → required role + strictness
 * 3. Fallback → `USER` (strict)
 *
 * @example
 * // Allow only ADMIN (strict, via @Roles decorator)
 * @Roles({ requiredRole: UserRoleEnum.ADMIN })
 * @Mutation(() => String)
 * deleteUser() { ... }
 *
 * // Allow any authenticated user (hierarchical)
 * @Roles({ requiredRole: UserRoleEnum.USER, strict: false })
 * @Mutation(() => String)
 * updateProfile() { ... }
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Determines whether the current request is allowed to proceed.
   *
   * @param context - The current execution context (GraphQL resolver or HTTP handler).
   * @returns `true` if access is granted.
   * @throws {GatewayException} 403 `ROLE_NOT_ALLOWED` if the user's role
   *   does not satisfy the required role.
   */
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<PublicDecoratorParams>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || {
      makePublicRoleGuard: false,
      makePublicAccessGuard: false,
    };

    if (isPublic.makePublicRoleGuard) return true;

    const {requiredRole, strict} = this.reflector.getAllAndOverride<RoleDecoratorParams>(ROLE_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]) || {
      strict: true,
      requiredRole: UserRoleEnum.USER,
    };

    const {req} = getRequestResponse<AccessRequest>(context);

    const userRole = req.user.role;

    const isAllowed: boolean = isRoleAccess({
      strict,
      userRole,
      requiredRole,
    });

    if (!isAllowed) {
      const strictMessage = strict
        ? " (strict mode: exact role match required)"
        : " (hierarchical mode: role must be equal or higher)";

      throw new GatewayException({
        statusCode: 403,
        code: "ROLE_NOT_ALLOWED",
        message: `Access denied. Your role (${userRole}) does not meet the required role (${requiredRole})${strictMessage}.`,
      });
    }

    return true;
  }
}
