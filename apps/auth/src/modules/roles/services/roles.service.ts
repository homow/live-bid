import {PinoLogger} from "nestjs-pino";
import {Injectable} from "@nestjs/common";
import {RolesPolicy} from "./roles-policy.service";
import {DrizzleService} from "@live-bid/services/modules";
import {UsersCacheService} from "@app/auth/modules/users/services";
import {AppException, throwNotFound} from "@live-bid/services/lib";
import {UsersRepository} from "@app/auth/modules/users/users.repository";
import type {ModifyRoleRequestService, ModifyRoleResponseService} from "@live-bid/services/types";

/**
 * **RolesService**
 *
 * Business-logic layer for role management.
 * Handles role modifications with strict policy enforcement, row-level locking,
 * and cache invalidation.
 *
 * @remarks
 * - **Policy-first:** All modifications are validated by `RolesPolicy`
 *   (both before the transaction and inside it).
 * - **Locking:** The target user is read with `FOR UPDATE` (`lock: true`)
 *   inside the transaction to prevent concurrent role changes.
 * - **Idempotency:** If the target user already has the requested role,
 *   a `409 ROLE_ALREADY_ASSIGNED` error is thrown.
 * - **Cache invalidation:** After commit, the target user's cache is cleared
 *   to reflect the new role immediately.
 *
 * ### Flow
 * 1. `assertCanModifyRole` (actor vs. target)
 * 2. Open transaction + lock target user (`FOR UPDATE`)
 * 3. `assertCanDemoteOwner` (protect the last owner)
 * 4. Reject no-op changes
 * 5. Persist new role
 * 6. Invalidate cache
 *
 * @example
 * const result = await rolesService.modifyRole({
 *   target: { id: "user-uuid", newRole: UserRoleEnum.ADMIN },
 *   actor: { id: "admin-uuid", role: UserRoleEnum.SUPER_ADMIN },
 * });
 */
@Injectable()
export class RolesService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly drizzle: DrizzleService,
    private readonly rolesPolicy: RolesPolicy,
    private readonly usersRepository: UsersRepository,
    private readonly usersCacheService: UsersCacheService,
  ) {
    this.logger.setContext(RolesService.name);
  }

  /**
   * **Modify the role of a target user.**
   *
   * Applies policy checks, locks the target user row inside a transaction,
   * and updates the role atomically.
   *
   * @param data - `{ target: { id, newRole }, actor }`.
   * @returns A summary of the change: `{ userId, newRole, result }`.
   *
   * @throws {AppException} 409 `ROLE_ALREADY_ASSIGNED` — target already has the requested role.
   * @throws {AppException} — Propagated from `RolesPolicy` (e.g., forbidden operations).
   * @throws {AppException} 404 — target user not found.
   */
  async modifyRole({target, actor}: ModifyRoleRequestService): Promise<ModifyRoleResponseService> {
    // Check roles policy
    this.rolesPolicy.assertCanModifyRole({target, actor});

    const result = await this.drizzle.db.transaction(
      async (tx) => {
        // Find target user (locked)
        const targetUser = await this.usersRepository.findOne(
          {
            lock: true,
            id: target.id,
          },
          true,
          tx
        );

        // If user doesn't exist:
        if (!targetUser) throwNotFound('User', 'id');

        this.rolesPolicy.assertCanDemoteOwner({
          id: targetUser.id,
          role: targetUser.role,
        });

        // If user already has new role:
        if (targetUser.role === target.newRole) throw new AppException({
          statusCode: 409,
          code: 'ROLE_ALREADY_ASSIGNED',
          message: `User already has the role ${target.newRole}`,
        });

        await this.usersRepository.updateRole(target.id, target.newRole, tx);

        return {
          userId: target.id,
          newRole: target.newRole,
          result: 'Target user role updated successfully.',
        };
      },
      {
        accessMode: 'read write',
        isolationLevel: 'read committed',
      }
    );

    // Invalidate user cache
    await this.usersCacheService.deleteUserCache(target.id);
    return result;
  }
}
