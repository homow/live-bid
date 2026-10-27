import {Public} from "@app/gateway/common";
import {applyDecorators} from "@nestjs/common";

export const getUsersProfile = () => applyDecorators(
  Public()
);
