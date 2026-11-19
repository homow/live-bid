import {SetMetadata} from "@nestjs/common";
import {IsRoleAccessParam} from "@live-bid/services/lib";

/**
 * Configuration parameters for the `@Role()` decorator.
 * Picks only the relevant fields from `IsRoleAccessParam`.
 *
 * - `requiredRole`: The minimum (or exact) role required to access the route.
 * - `strict`: If `true`, the user's role must exactly match `requiredRole`.
 *   If `false`, the user's role must be equal or higher (hierarchical).
 */
export type RoleDecoratorParams = Pick<IsRoleAccessParam, 'requiredRole' | 'strict'>;

/**
 * Metadata key used to store role configuration.
 * Read by `RoleGuard` to determine access permissions.
 */
export const ROLE_METADATA = "ROLE_METADATA";

/**
 * **@Role() Decorator**
 *
 * Attaches role-based access control (RBAC) metadata to a route, resolver,
 * or controller. The `RoleGuard` reads this metadata to enforce the restriction.
 *
 * @remarks
 * - Can be applied at both the **class level** and **method level**.
 *   Method-level metadata takes precedence over class-level.
 * - Works in tandem with `@Public()`: if a route is marked public
 *   (and `makePublicRoleGuard` is `true`), the role check is skipped entirely.
 *
 * @param params - Role configuration: `{ requiredRole, strict }`.
 *
 * @example
 * Strict mode: only ADMIN can access
 * @Role({ requiredRole: UserRoleEnum.ADMIN, strict: true })
 * @Mutation(() => String)
 * deleteUser() { ... }
 *
 * **Hierarchical mode: ADMIN or higher (e.g., SUPER_ADMIN) can access**
 * @Role({ requiredRole: UserRoleEnum.ADMIN, strict: false })
 * @Mutation(() => String)
 * manageUsers() { ... }
 */
export const Role = (
  params: RoleDecoratorParams
) => SetMetadata(ROLE_METADATA, params);
