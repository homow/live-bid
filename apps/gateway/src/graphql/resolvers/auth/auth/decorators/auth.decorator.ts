import {Public} from "@app/gateway/common/decorators";
import {RefreshGuard} from "@app/gateway/common/guards";
import {applyDecorators, UseGuards} from "@nestjs/common";

export const RegisterDecorators = () => applyDecorators(
  Public(),
);

export const LoginDecorators = () => applyDecorators(
  Public()
);

export const RefreshDecorators = () => applyDecorators(
  Public(),
  UseGuards(RefreshGuard),
);

export const LogoutDecorators = () => applyDecorators(
  Public()
);

export const ForgotPasswordDecorators = () => applyDecorators(
  Public()
);

export const ResetPasswordDecorators = () => applyDecorators(
  Public()
);
