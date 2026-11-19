import {PinoLogger} from "nestjs-pino";
import {Injectable} from "@nestjs/common";
import {AppException} from "@live-bid/services/lib";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import type {ModifyRoleRequestService} from "@live-bid/services/types";

/**
 * **RolesPolicy**
 *
 * Pure, side-effect-free policy checks for role modifications.
 * This service contains **no DB access** and **no transaction logic**;
 * it only validates rules and throws `AppException` on violations.
 *
 * @remarks
 * Separating policy from business logic (`RolesService`) keeps the rules
 * easy to test, audit, and reason about in isolation.
 *
 * ### Enforced policies
 * | # | Rule | When |
 * |---|---|---|
 * | 1 | Actor must be `OWNER` (defense in depth) | Before transaction |
 * | 2 | Actor cannot modify their own role | Before transaction |
 * | 3 | `OWNER` cannot be assigned via API | Before transaction |
 * | 4 | `OWNER` cannot be demoted via API | Inside transaction (needs DB state) |
 *
 * @example
 * // Before opening a transaction
 * this.rolesPolicy.assertCanModifyRole({ actor, target });
 *
 * // Inside the transaction (after locking the target user)
 * this.rolesPolicy.assertCanDemoteOwner({ id: targetUser.id, role: targetUser.role });
 */
@Injectable()
export class RolesPolicy {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(RolesPolicy.name);
  }

  /**
   * **Assert that the actor is allowed to modify the target's role.**
   *
   * Runs **before** the DB transaction, since it only needs the request payload.
   *
   * @param data - `{ actor, target }` with the actor's role and the target's new role.
   *
   * @throws {AppException} 403 `ROLE_MODIFICATION_REQUIRES_OWNER` — actor is not `OWNER`.
   * @throws {AppException} 403 `ROLE_SELF_MODIFICATION_NOT_ALLOWED` — actor targets themselves.
   * @throws {AppException} 403 `OWNER_ROLE_ASSIGNMENT_FORBIDDEN` — target new role is `OWNER`.
   */
  assertCanModifyRole({actor, target}: ModifyRoleRequestService): void {
    // ── 1. Defense in depth: RoleGuard should have blocked non-OWNER already.
    if (actor.role !== UserRoleEnum.OWNER) {
      this.logger.error(
        {actorId: actor.id, actorRole: actor.role, targetId: target.id, newRole: target.newRole},
        "SECURITY: non-OWNER reached modifyRole — RoleGuard is bypassed or misconfigured",
      );

      throw new AppException({
        statusCode: 403,
        code: 'ROLE_MODIFICATION_REQUIRES_OWNER',
        message: 'Only an owner can modify roles.',
      });
    }

    // ── 2. Actor cannot change their own role: blocks accidental self-demotion and
    // privilege escalation from a compromised session.
    if (target.id === actor.id) {
      this.logger.warn(
        {actorId: actor.id, targetId: target.id, newRole: target.newRole},
        "Blocked self role modification",
      );

      throw new AppException({
        statusCode: 403,
        code: 'ROLE_SELF_MODIFICATION_NOT_ALLOWED',
        message: 'You cannot modify your own role. Ask another owner to perform this action.',
      });
    }

    // ── 3. OWNER is DB/CLI only — never assignable through the API, so the highest
    // privilege level always requires a human operator.
    if (target.newRole === UserRoleEnum.OWNER) {
      this.logger.warn(
        {actorId: actor.id, targetId: target.id, newRole: target.newRole},
        "Blocked OWNER role assignment via API",
      );

      throw new AppException({
        statusCode: 403,
        code: 'OWNER_ROLE_ASSIGNMENT_FORBIDDEN',
        message: 'The owner role cannot be assigned via the API. It must be set by a platform operator.',
      });
    }
  }

  /**
   * **Assert that the target user can be demoted.**
   *
   * Runs **inside** the transaction because it depends on the target's
   * current role from the database.
   *
   * @param targetUser - `{ id, role }` of the locked target user.
   *
   * @throws {AppException} 403 `OWNER_DEMOTION_FORBIDDEN` — target currently holds `OWNER`.
   */
  assertCanDemoteOwner(targetUser: { id: string; role: UserRoleEnum }): void {
    if (targetUser.role === UserRoleEnum.OWNER) {
      this.logger.warn(
        {targetId: targetUser.id, currentRole: targetUser.role},
        "Blocked OWNER role demotion via API",
      );

      throw new AppException({
        statusCode: 403,
        code: 'OWNER_DEMOTION_FORBIDDEN',
        message: 'The owner role cannot be revoked via the API. It must be changed by a platform operator.',
      });
    }
  }
}
