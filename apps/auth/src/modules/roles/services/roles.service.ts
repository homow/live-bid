import {PinoLogger} from "nestjs-pino";
import {Injectable} from "@nestjs/common";
import {AppException} from "@live-bid/services/lib";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {DrizzleService} from "@live-bid/services/modules";
import {UsersCacheService} from "@app/auth/modules/users/services";
import type {ModifyRoleRequestService} from "@live-bid/services/types";
import {UsersRepository} from "@app/auth/modules/users/users.repository";

@Injectable()
export class RolesService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly drizzle: DrizzleService,
    private readonly usersRepository: UsersRepository,
    private readonly usersCacheService: UsersCacheService,
  ) {
    this.logger.setContext(RolesService.name);
  }

  private assertCanModifyRole({actor, target}: ModifyRoleRequestService) {
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

  async modifyRole({target, actor}: ModifyRoleRequestService) {
    // Check roles policy
    this.assertCanModifyRole({target, actor});

    await this.drizzle.db.transaction(async (tx) => {
      // Find target user
      const targetUser = await this.usersRepository.findOne({
        id: target.id,
        lock: true,
      }, true, tx);
    });

  }
}
