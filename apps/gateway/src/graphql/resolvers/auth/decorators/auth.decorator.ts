import {Public, RefreshGuard} from "@app/gateway/common";
import {applyDecorators, UseGuards} from "@nestjs/common";

export const RegisterDecorators = () => applyDecorators(
  Public(),
);

export const LoginDecorators = () => applyDecorators(
  Public()
);

export const RefreshDecorators = () => applyDecorators(
  UseGuards(RefreshGuard),
);
