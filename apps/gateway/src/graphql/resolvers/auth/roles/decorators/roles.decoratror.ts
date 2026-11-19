import {applyDecorators} from "@nestjs/common";
import {Role} from "@app/gateway/common/decorators";
import {UserRoleEnum} from "@live-bid/contracts/enums";

export const GetModifyRoleDecorators = () => applyDecorators(
  Role({
    strict: true,
    requiredRole: UserRoleEnum.OWNER,
  })
);
