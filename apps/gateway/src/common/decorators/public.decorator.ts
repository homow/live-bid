import {SetMetadata} from "@nestjs/common";

/**
 * Configuration options for the `@Public()` decorator.
 *
 * Allows granular control over which guards should be bypassed for a
 * specific route or resolver.
 */
export interface PublicDecoratorParams {
  /**
   * If `true`, the Role Guard (e.g., `RolesGuard`) will ignore this route.
   */
  makePublicRoleGuard: boolean;

  /**
   * If `true`, the Access/Auth Guard (e.g., `JwtAuthGuard`) will ignore this route.
   */
  makePublicAccessGuard: boolean;
}

/**
 * Metadata key used to store the public configuration.
 * Read by custom guards to determine if they should allow access.
 */
export const IS_PUBLIC_KEY = "IS_PUBLIC";

/**
 * **@Public() Decorator**
 *
 * Marks a route, resolver, or controller as publicly accessible.
 * By default, it bypasses **both** the Role Guard and the Access Guard.
 *
 * @remarks
 * - Custom guards must read the `IS_PUBLIC_KEY` metadata (usually via `Reflector`)
 *   to respect this decorator.
 * - You can selectively bypass only one of the guards by passing a partial object.
 *   (e.g., `@Public({ makePublicAccessGuard: true, makePublicRoleGuard: false })`
 *   would allow access without a token, but still enforce role checks).
 *
 * @param params - Configuration for which guards to bypass.
 *                 Defaults to bypassing both guards.
 *
 * @example
 * // Bypass all guards (fully public)
 * @Public()
 * @Query(() => String)
 * getPublicData() { ... }
 *
 * // Bypass only the access guard (still requires a specific role, though unusual)
 * @Public({ makePublicAccessGuard: true, makePublicRoleGuard: false })
 * @Mutation(() => String)
 * specialAction() { ... }
 */
export const Public = (
  params: Partial<PublicDecoratorParams> = {
    makePublicRoleGuard: true,
    makePublicAccessGuard: true,
  }
) => SetMetadata(IS_PUBLIC_KEY, params);
