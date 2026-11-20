import {applyDecorators} from "@nestjs/common";
import {Role} from "@app/gateway/common/decorators";
import {UserRoleEnum} from "@live-bid/contracts/enums";

export const GetPublicProfileDecorators = () => applyDecorators(
  Role({
    requiredRole: UserRoleEnum.USER
  })
);

export const GetMyProfileDecorators = () => applyDecorators(
  Role({
    requiredRole: UserRoleEnum.USER
  }),
);

export const GetUpdateProfileDecorators = () => applyDecorators(
  Role({
    requiredRole: UserRoleEnum.USER
  })
);

export const GetFindOneUserDecorators = () => applyDecorators(
  Role({
    requiredRole: UserRoleEnum.ADMIN
  })
);

export const GetUsersListDecorators = () => applyDecorators(
  Role({
    requiredRole: UserRoleEnum.ADMIN
  })
);
