import {PinoLogger} from "nestjs-pino";
import {Injectable} from "@nestjs/common";
import {AppException} from "@live-bid/services/lib";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import type {ModifyRoleRequestService} from "@live-bid/services/types";

@Injectable()
export class RolesService {
  constructor(
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RolesService.name);
  }

  modifyRole({target, actor}: ModifyRoleRequestService) {
    // Actor cannot change their own role: blocks accidental self-demotion and
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

    // OWNER is DB/CLI only — never assignable through the API, so the highest
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
}
