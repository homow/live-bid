import {PinoLogger} from "nestjs-pino";
import {Injectable} from "@nestjs/common";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {AppException} from "@live-bid/services/lib";
import type {ModifyRoleRequestService} from "@live-bid/services/types";

/**
 * RolesPolicy — pure policy checks for role modification.
 * No DB, no transaction, no side effects. Only throws or returns.
 *
 * Policies:
 * #1: actor must be OWNER (defense in depth — RoleGuard should have caught this)
 * #2: actor cannot modify their own role
 * #3: OWNER cannot be assigned via API
 * #4: OWNER cannot be demoted via API (symmetric with #3)
 */
@Injectable()
export class RolesPolicy {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(RolesPolicy.name);
  }

  /**
   * Policies that can be checked BEFORE the transaction
   * (only need the request payload, not the DB).
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

    // ── 3.OWNER is DB/CLI only — never assignable through the API, so the highest
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
   * Policies that need the current DB role, so they run INSIDE the transaction.
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
