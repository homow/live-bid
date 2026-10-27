import {Role} from "@app/gateway/common";
import {applyDecorators} from "@nestjs/common";
import {UserRoleEnum} from "@live-bid/contracts/enums";

export const getUsersProfile = () => applyDecorators(
  Role({
    requiredRole: UserRoleEnum.USER
  })
);
