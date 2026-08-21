import {UserRoleEnum} from "@live-bid/contracts/enums";

/**
 * ============================================================
 *  ROLE-BASED ACCESS CONTROL (RBAC) UTILITIES
 * ============================================================
 *
 * A lightweight hierarchical RBAC system for managing user permissions
 * across the application. This module provides:
 *
 * - A strict and extensible role enumeration (`UserRoleEnum`)
 * - A hierarchical ranking system (`ROLE_HIERARCHY`)
 * - A flexible access-check function supporting both hierarchical
 *   and strict (exact-match) role evaluation.
 *
 * This is ideal for applications requiring role-based authorization,
 * from simple user/admin separation to more structured multi-role flows.
 *
 * @module Roles
 * @see UserRoleEnum
 * @see isRoleAccess
 */

/**
 * Represents the role hierarchy levels.
 *
 * Higher numeric value = greater privilege.
 * Used internally by `isRoleAccess` to determine inheritance.
 */
export const ROLE_HIERARCHY = {
  [UserRoleEnum.USER]: 0,
  [UserRoleEnum.ADMIN]: 1,
  [UserRoleEnum.OWNER]: 2,
} as const;

/**
 * Parameters for evaluating role-based access.
 */
interface IsRoleAccessParam {
  /**
   * The role of the currently authenticated user.
   * Determines the base access level.
   */
  userRole: UserRoleEnum;

  /**
   * The minimum role required to perform the action.
   * Access is granted if userRole has equal or higher hierarchy level.
   */
  requiredRole: UserRoleEnum;

  /**
   * If `true`, access is granted **only** when `userRole` is **exactly** equal to `requiredRole`.
   * If `false` or omitted, access is granted when `userRole` is **equal or higher** than `requiredRole`.
   *
   * @default false
   */
  strict?: boolean;
}

/**
 * Checks whether a user's role meets the required access level.
 *
 * By default, it uses a hierarchical model where higher roles inherit
 * permissions from lower ones (e.g., ADMIN can access USER routes).
 *
 * If `strict` is set to `true`, the check becomes exact-match only.
 *
 * @param params - Access check parameters.
 * @returns `true` if access is granted, otherwise `false`.
 *
 * @example
 * // Default: hierarchical (ADMIN can access USER routes)
 * isRoleAccess({ userRole: UserRoleEnum.ADMIN, requiredRole: UserRoleEnum.USER }) // true
 *
 * @example
 * // Strict mode: only exact match
 * isRoleAccess({ userRole: UserRoleEnum.ADMIN, requiredRole: UserRoleEnum.USER, strict: true }) // false
 */
export function isRoleAccess({ userRole, requiredRole, strict = false }: IsRoleAccessParam): boolean {
  const userRoleHierarchy = ROLE_HIERARCHY[userRole];
  const requiredHierarchy = ROLE_HIERARCHY[requiredRole];

  if (strict) {
    return userRoleHierarchy === requiredHierarchy;
  }

  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
