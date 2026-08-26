import {Controller} from "@nestjs/common";
import {AuthService} from "./services/auth.service";
import * as ZodSchemas from "@live-bid/contracts/schemas";
import {MessagePattern, Payload} from "@nestjs/microservices";
import * as ServiceMessages from "@live-bid/services/messages";
import type {LoginRequest, LoginResponse, RegisterResponse, ValidateRefreshRequest} from "@live-bid/services/types";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(ServiceMessages.AUTH_PATTERNS.REGISTER)
  register(
    @Payload() input: ZodSchemas.RegisterUserSchemaType
  ): Promise<RegisterResponse> {
    return this.authService.register(input);
  }

  @MessagePattern(ServiceMessages.AUTH_PATTERNS.LOGIN)
  login(
    @Payload() input: LoginRequest,
  ): Promise<LoginResponse> {
    return this.authService.login(input.userData, input.clientInfo);
  }

  @MessagePattern(ServiceMessages.AUTH_PATTERNS.VALIDATE_REFRESH_TOKEN)
  validateRefreshToken(
    @Payload() input: ValidateRefreshRequest,
  ) {
    return this.authService.validateRefresh(input);
  }
}
