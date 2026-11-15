import {RolesService} from "./services";
import {Controller} from "@nestjs/common";
import {ROLES_MESSAGES} from "@live-bid/services/messages";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {ModifyRoleRequestService, ModifyRoleResponseService} from "@live-bid/services/types";

@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @MessagePattern(ROLES_MESSAGES.MODIFY_ROLE)
  modifyRole(
    @Payload() payload: ModifyRoleRequestService
  ): Promise<ModifyRoleResponseService> {
    return this.rolesService.modifyRole(payload);
  }
}
