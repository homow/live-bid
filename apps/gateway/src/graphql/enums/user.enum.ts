import {registerEnumType} from "@nestjs/graphql";
import {UserRoleEnum} from "@live-bid/contracts/enums";

registerEnumType(UserRoleEnum, {
  name: "UserRoleEnum",
});

export {UserRoleEnum};