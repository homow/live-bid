import {createParamDecorator} from "@nestjs/common";
import {getRequestResponse} from "@app/gateway/lib/utils";

/**
 * **@CurrentUser() Parameter Decorator**
 *
 * Injects the authenticated user object into a resolver or controller method.
 *
 * @remarks
 * - Expects the `req.user` object to have been populated by an authentication
 *   guard (e.g., `AccessTokenGuard`) earlier in the request lifecycle.
 * - If used without a preceding auth guard, `req.user` will be `undefined`.
 * - Works with both HTTP and GraphQL execution contexts via `getRequestResponse`.
 *
 * @example
 * @UseGuards(AccessTokenGuard)
 * @Mutation(() => String)
 * updateProfile(@CurrentUser() user: UserAccess) {
 *   return this.usersService.update(user.userId);
 * }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context) => {
    const ctx = getRequestResponse(context);
    return ctx.req.user;
  },
);
