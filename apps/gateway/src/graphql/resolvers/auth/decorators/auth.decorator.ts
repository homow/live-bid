import {Public} from "@app/gateway/common";
import {applyDecorators} from "@nestjs/common";

export const RegisterDecorators = () => applyDecorators(
  Public(),
);

export const LoginDecorators = () => applyDecorators(
  Public()
);
